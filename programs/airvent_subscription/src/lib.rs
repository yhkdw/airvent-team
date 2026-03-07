use anchor_lang::prelude::*;

// ─────────────────────────────────────────────────────────
// AirVent DePIN 구독 관리 스마트 컨트랙트
// ─────────────────────────────────────────────────────────
// 프로그램 ID (배포 후 실제 값으로 교체)
declare_id!("C245wF5gEDvBzgtskqooaz4yCdqFrgutt1CLub8iLWsF");

/// 하드웨어 시리얼 최대 길이 (바이트)
const MAX_HARDWARE_ID_LEN: usize = 64;

/// 단일 적립 최대 포인트 (부정 방지)
const MAX_SINGLE_EARN: u64 = 1_000;

#[program]
pub mod airvent_subscription {
    use super::*;

    /// 1. 무료 구독자 계정 생성 (대시보드 가입 시 호출)
    pub fn initialize_free_subscription(ctx: Context<InitializeSubscription>) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;
        user_state.owner = ctx.accounts.user.key();
        user_state.authority = ctx.accounts.authority.key();
        user_state.is_premium = false;
        user_state.offchain_points = 0;
        user_state.hardware_id = String::new();
        user_state.has_hardware = false;
        user_state.joined_at = Clock::get()?.unix_timestamp;
        user_state.bump = ctx.bumps.user_state;

        msg!(
            "AirVent 무료 구독 계정이 생성되었습니다. Owner: {}",
            user_state.owner
        );
        Ok(())
    }

    /// 2. 무료 구독자 활동 포인트 적립 (서버/오라클이 authority로 서명)
    pub fn earn_free_points(ctx: Context<EarnPoints>, points_to_add: u64) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;

        // 프리미엄 유저는 별도의 토큰 채굴 로직을 사용하므로 무료 구독자만 적립
        require!(!user_state.is_premium, AirventError::AlreadyPremium);

        // 단일 적립량 제한 (부정 방지)
        require!(
            points_to_add > 0 && points_to_add <= MAX_SINGLE_EARN,
            AirventError::InvalidPointsAmount
        );

        // 오버플로우 안전 처리
        user_state.offchain_points = user_state
            .offchain_points
            .checked_add(points_to_add)
            .ok_or(AirventError::PointsOverflow)?;

        msg!(
            "{} 포인트가 적립되었습니다. 총 포인트: {}",
            points_to_add,
            user_state.offchain_points
        );
        Ok(())
    }

    /// 3. 프리미엄(하드웨어 노드) 티어로 업그레이드
    pub fn upgrade_to_premium(
        ctx: Context<UpgradeSubscription>,
        hardware_serial: String,
    ) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;

        // 이미 프리미엄인 경우 차단
        require!(!user_state.is_premium, AirventError::AlreadyPremium);

        // 하드웨어 시리얼 유효성 검증
        require!(
            !hardware_serial.is_empty() && hardware_serial.len() <= MAX_HARDWARE_ID_LEN,
            AirventError::InvalidHardwareSerial
        );

        user_state.is_premium = true;
        user_state.hardware_id = hardware_serial.clone();
        user_state.has_hardware = true;

        // 업그레이드 시 보유 포인트 초기화 (하드웨어 구매 할인 사용 등)
        user_state.offchain_points = 0;

        msg!(
            "프리미엄 노드로 업그레이드 완료! Hardware ID: {}",
            hardware_serial
        );
        Ok(())
    }

    /// 4. 프리미엄 해제 (하드웨어 반납/해지 시)
    pub fn downgrade_from_premium(ctx: Context<UpgradeSubscription>) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;

        require!(user_state.is_premium, AirventError::NotPremium);

        user_state.is_premium = false;
        user_state.hardware_id = String::new();
        user_state.has_hardware = false;

        msg!("프리미엄 해제 완료. 무료 구독으로 전환되었습니다.");
        Ok(())
    }
}

// ─────────────────────────────────────────────────────────
// Account Contexts (Instruction 별 계정 구조)
// ─────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeSubscription<'info> {
    #[account(
        init,
        payer = user,
        // Space: discriminator(8) + owner(32) + authority(32) + is_premium(1)
        //      + offchain_points(8) + hardware_id(4+MAX_HARDWARE_ID_LEN)
        //      + has_hardware(1) + joined_at(8) + bump(1)
        space = 8 + 32 + 32 + 1 + 8 + (4 + MAX_HARDWARE_ID_LEN) + 1 + 8 + 1,
        seeds = [b"subscription", user.key().as_ref()],
        bump
    )]
    pub user_state: Account<'info, UserState>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// 포인트 적립을 수행할 수 있는 관리자/오라클 (서버 지갑)
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EarnPoints<'info> {
    #[account(
        mut,
        seeds = [b"subscription", owner.key().as_ref()],
        bump = user_state.bump,
        constraint = user_state.owner == owner.key() @ AirventError::Unauthorized
    )]
    pub user_state: Account<'info, UserState>,

    /// 포인트를 받을 사용자의 지갑 (서명 불필요 — 오라클이 대리 적립)
    /// CHECK: owner는 user_state의 owner와 일치 검증만 수행
    pub owner: UncheckedAccount<'info>,

    /// 관리자/오라클 서명자 — 부정 적립 방지
    #[account(
        constraint = authority.key() == user_state.authority @ AirventError::Unauthorized
    )]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpgradeSubscription<'info> {
    #[account(
        mut,
        seeds = [b"subscription", user.key().as_ref()],
        bump = user_state.bump,
        constraint = user_state.owner == user.key() @ AirventError::Unauthorized
    )]
    pub user_state: Account<'info, UserState>,

    /// 본인만 업그레이드/다운그레이드 가능
    pub user: Signer<'info>,
}

// ─────────────────────────────────────────────────────────
// Account Data (온체인 저장 구조)
// ─────────────────────────────────────────────────────────

#[account]
pub struct UserState {
    /// 계정 소유자 Pubkey
    pub owner: Pubkey,            // 32 bytes
    /// 포인트 적립 권한이 있는 관리자/오라클 Pubkey
    pub authority: Pubkey,        // 32 bytes
    /// 무료 구독(false) / 하드웨어 연동 프리미엄(true)
    pub is_premium: bool,         // 1 byte
    /// 앱 활동으로 모은 포인트 (무료 구독자용)
    pub offchain_points: u64,     // 8 bytes
    /// 연동된 하드웨어 시리얼 번호 (최대 64자)
    pub hardware_id: String,      // 4 + MAX_HARDWARE_ID_LEN bytes
    /// 하드웨어 연동 여부 (hardware_id가 비어있지 않은지)
    pub has_hardware: bool,       // 1 byte
    /// 가입 일자 (Unix timestamp)
    pub joined_at: i64,           // 8 bytes
    /// PDA bump seed
    pub bump: u8,                 // 1 byte
}

// ─────────────────────────────────────────────────────────
// Error Codes
// ─────────────────────────────────────────────────────────

#[error_code]
pub enum AirventError {
    #[msg("이미 프리미엄 하드웨어 노드로 등록된 계정입니다.")]
    AlreadyPremium,

    #[msg("프리미엄 계정이 아닙니다.")]
    NotPremium,

    #[msg("권한이 없습니다. 올바른 서명자를 사용하세요.")]
    Unauthorized,

    #[msg("포인트 적립량이 유효하지 않습니다. (1~1000)")]
    InvalidPointsAmount,

    #[msg("포인트 오버플로우가 발생했습니다.")]
    PointsOverflow,

    #[msg("하드웨어 시리얼이 유효하지 않습니다. (1~64자)")]
    InvalidHardwareSerial,
}
