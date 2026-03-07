/**
 * AirVent Subscription — Anchor IDL 타입 정의
 *
 * 이 파일은 스마트 컨트랙트(lib.rs)와 1:1 대응하는
 * TypeScript 타입을 정의합니다.
 *
 * `anchor build` 후 자동 생성되는 IDL JSON을 대체하여
 * 프론트엔드에서 직접 사용할 수 있습니다.
 */

export type AirventSubscription = {
    version: "0.1.0";
    name: "airvent_subscription";
    instructions: [
        {
            name: "initializeFreeSubscription";
            accounts: [
                { name: "userState"; isMut: true; isSigner: false },
                { name: "user"; isMut: true; isSigner: true },
                { name: "authority"; isMut: false; isSigner: true },
                { name: "systemProgram"; isMut: false; isSigner: false }
            ];
            args: [];
        },
        {
            name: "earnFreePoints";
            accounts: [
                { name: "userState"; isMut: true; isSigner: false },
                { name: "owner"; isMut: false; isSigner: false },
                { name: "authority"; isMut: false; isSigner: true }
            ];
            args: [{ name: "pointsToAdd"; type: "u64" }];
        },
        {
            name: "upgradeToPremium";
            accounts: [
                { name: "userState"; isMut: true; isSigner: false },
                { name: "user"; isMut: false; isSigner: true }
            ];
            args: [{ name: "hardwareSerial"; type: "string" }];
        },
        {
            name: "downgradeFromPremium";
            accounts: [
                { name: "userState"; isMut: true; isSigner: false },
                { name: "user"; isMut: false; isSigner: true }
            ];
            args: [];
        }
    ];
    accounts: [
        {
            name: "UserState";
            type: {
                kind: "struct";
                fields: [
                    { name: "owner"; type: "publicKey" },
                    { name: "authority"; type: "publicKey" },
                    { name: "isPremium"; type: "bool" },
                    { name: "offchainPoints"; type: "u64" },
                    { name: "hardwareId"; type: "string" },
                    { name: "hasHardware"; type: "bool" },
                    { name: "joinedAt"; type: "i64" },
                    { name: "bump"; type: "u8" }
                ];
            };
        }
    ];
    errors: [
        { code: 6000; name: "AlreadyPremium"; msg: "이미 프리미엄 하드웨어 노드로 등록된 계정입니다." },
        { code: 6001; name: "NotPremium"; msg: "프리미엄 계정이 아닙니다." },
        { code: 6002; name: "Unauthorized"; msg: "권한이 없습니다." },
        { code: 6003; name: "InvalidPointsAmount"; msg: "포인트 적립량이 유효하지 않습니다. (1~1000)" },
        { code: 6004; name: "PointsOverflow"; msg: "포인트 오버플로우가 발생했습니다." },
        { code: 6005; name: "InvalidHardwareSerial"; msg: "하드웨어 시리얼이 유효하지 않습니다. (1~64자)" }
    ];
};

/** IDL JSON 객체 — Anchor Program 초기화에 사용 */
export const IDL: AirventSubscription = {
    version: "0.1.0",
    name: "airvent_subscription",
    instructions: [
        {
            name: "initializeFreeSubscription",
            accounts: [
                { name: "userState", isMut: true, isSigner: false },
                { name: "user", isMut: true, isSigner: true },
                { name: "authority", isMut: false, isSigner: true },
                { name: "systemProgram", isMut: false, isSigner: false },
            ],
            args: [],
        },
        {
            name: "earnFreePoints",
            accounts: [
                { name: "userState", isMut: true, isSigner: false },
                { name: "owner", isMut: false, isSigner: false },
                { name: "authority", isMut: false, isSigner: true },
            ],
            args: [{ name: "pointsToAdd", type: "u64" }],
        },
        {
            name: "upgradeToPremium",
            accounts: [
                { name: "userState", isMut: true, isSigner: false },
                { name: "user", isMut: false, isSigner: true },
            ],
            args: [{ name: "hardwareSerial", type: "string" }],
        },
        {
            name: "downgradeFromPremium",
            accounts: [
                { name: "userState", isMut: true, isSigner: false },
                { name: "user", isMut: false, isSigner: true },
            ],
            args: [],
        },
    ],
    accounts: [
        {
            name: "UserState",
            type: {
                kind: "struct",
                fields: [
                    { name: "owner", type: "publicKey" },
                    { name: "authority", type: "publicKey" },
                    { name: "isPremium", type: "bool" },
                    { name: "offchainPoints", type: "u64" },
                    { name: "hardwareId", type: "string" },
                    { name: "hasHardware", type: "bool" },
                    { name: "joinedAt", type: "i64" },
                    { name: "bump", type: "u8" },
                ],
            },
        },
    ],
    errors: [
        { code: 6000, name: "AlreadyPremium", msg: "이미 프리미엄 하드웨어 노드로 등록된 계정입니다." },
        { code: 6001, name: "NotPremium", msg: "프리미엄 계정이 아닙니다." },
        { code: 6002, name: "Unauthorized", msg: "권한이 없습니다." },
        { code: 6003, name: "InvalidPointsAmount", msg: "포인트 적립량이 유효하지 않습니다. (1~1000)" },
        { code: 6004, name: "PointsOverflow", msg: "포인트 오버플로우가 발생했습니다." },
        { code: 6005, name: "InvalidHardwareSerial", msg: "하드웨어 시리얼이 유효하지 않습니다. (1~64자)" },
    ],
};
