import Container from "./Container";


interface ProductSpecsProps {
    lang: "ko" | "en";
}

export default function ProductSpecs({ lang }: ProductSpecsProps) {
    const t = {
        ko: {
            lineup: "PRODUCT LINEUP",
            title: "AirVent 선택하기",
            desc: "환경에 맞는 최적의 디바이스를 선택하고 AirVent DePIN 네트워크에 참여하세요.",
            pro: {
                tag: "HOME & OFFICE",
                name: "AirVent Pro",
                specs: [
                    "4.3인치 터치스크린 / 실시간 모니터링",
                    "PM1.0, PM2.5, PM10, CO2, TVOC, 온습도",
                    "Wi-Fi 6 메쉬 네트워크 지원",
                    "매일 포인트 보상"
                ]
            },
            titan: {
                tagBadge: "고성능",
                tag: "산업 및 대형 공간",
                name: "AirVent Titan",
                specs: [
                    "7인치 터치스크린 / 실시간 모니터링",
                    "PM1.0, PM2.5, PM10, CO2, TVOC, 온습도",
                    "Wi-Fi 6 메쉬 네트워크 지원",
                    "매일 포인트 보상 (1.5배 리워드)"
                ]
            },
            fly: {
                tag: "PERSONAL & PORTABLE",
                name: "AirVent Fly",
                specs: [
                    "매월 합리적인 구독형 라이선스",
                    "매일/매월 친환경 뉴스 및 공기질 데이터 제공(등급별 차등)",
                    "노드 구입 혜택 제공",
                    "매일 포인트 보상"
                ]
            }
        },
        en: {
            lineup: "PRODUCT LINEUP",
            title: "Choose Your AirVent",
            desc: "Select the optimal device for your environment and join the AirVent DePIN network.",
            pro: {
                tag: "HOME & OFFICE",
                name: "AirVent Pro",
                specs: [
                    "4.3 inch Touch Screen / Real-time Monitoring",
                    "PM1.0, PM2.5, PM10, CO2, TVOC, Temp/Humidity",
                    "Wi-Fi 6 Mesh Network Support",
                    "Earn Points Daily"
                ]
            },
            titan: {
                tagBadge: "HIGH PERFORMANCE",
                tag: "INDUSTRIAL & LARGE SPACE",
                name: "AirVent Titan",
                specs: [
                    "7 inch Touch Screen / Real-time Monitoring",
                    "PM1.0, PM2.5, PM10, CO2, TVOC, Temp/Humidity",
                    "Wi-Fi 6 Mesh Network Support",
                    "Earn Points Daily (1.5x Rewards)"
                ]
            },
            fly: {
                tag: "PERSONAL & PORTABLE",
                name: "AirVent Fly",
                specs: [
                    "Affordable monthly subscription license",
                    "Daily/Monthly eco-news & air quality data (Tiered)",
                    "Exclusive node purchase benefits",
                    "Earn points daily"
                ]
            }
        }
    };

    const text = t[lang];

    return (
        <section className="py-20 bg-slate-900/30">
            <Container>
                <div className="text-center mb-16">
                    <div className="text-emerald-400 font-semibold tracking-wider mb-2">{text.lineup}</div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
                        {text.title}
                    </h2>
                    <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto">
                        {text.desc}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* AirVent Pro */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-8 backdrop-blur hover:border-emerald-500/50 transition duration-300">
                        <div className="text-xs font-bold text-emerald-500 mb-2">{text.pro.tag}</div>
                        <h3 className="text-2xl font-bold text-slate-100 mb-4">{text.pro.name}</h3>
                        <div className="h-80 bg-white/5 rounded-xl mb-6 flex items-center justify-center border border-slate-800 overflow-hidden p-2 relative group-hover:border-emerald-500/30 transition transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                            <img src="/airvent_pro.png" alt="AirVent Pro 4.3 inch" className="h-[90%] w-[90%] object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(16,185,129,0.3)] transform group-hover:scale-105 transition duration-700" />
                        </div>

                        <ul className="space-y-3">
                            {text.pro.specs.map((spec, i) => (
                                <li key={i} className="flex items-center text-slate-300">
                                    <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {spec}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* AirVent Titan */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-8 backdrop-blur relative overflow-hidden group hover:border-purple-500/50 transition duration-300">
                        <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                            {text.titan.tagBadge}
                        </div>
                        <div className="text-xs font-bold text-purple-400 mb-2">{text.titan.tag}</div>
                        <h3 className="text-2xl font-bold text-slate-100 mb-4">{text.titan.name}</h3>
                        <div className="h-80 bg-white/5 rounded-xl mb-6 flex items-center justify-center border border-slate-800 overflow-hidden p-2 relative group-hover:border-purple-500/30 transition transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                            <img src="/airvent_titan.png" alt="AirVent Titan 7 inch" className="h-[90%] w-[90%] object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(168,85,247,0.3)] transform group-hover:scale-105 transition duration-700" />
                        </div>

                        <ul className="space-y-3">
                            {text.titan.specs.map((spec: any, i: number) => (
                                <li key={i} className="flex items-center text-slate-300">
                                    <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span dangerouslySetInnerHTML={{ __html: spec.replace(/\(.*\)/, '<b>$&</b>') }} />
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* AirVent Fly (Subscription) */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-8 backdrop-blur relative overflow-hidden group hover:border-sky-500/50 transition duration-300">
                        <div className="absolute top-0 right-0 bg-sky-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                            SUBSCRIPTION
                        </div>
                        <div className="text-xs font-bold text-sky-400 mb-2">{text.fly.tag}</div>
                        <h3 className="text-2xl font-bold text-slate-100 mb-4">{text.fly.name}</h3>
                        <div className="h-80 bg-white/5 rounded-xl mb-6 flex items-center justify-center border border-slate-800 overflow-hidden p-2 relative group-hover:border-sky-500/30 transition transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                            <img src="/airvent-logo.png" alt="AirVent Fly" className="h-[90%] w-[90%] object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(14,165,233,0.3)] transform group-hover:scale-105 transition duration-700" />
                        </div>

                        <ul className="space-y-3">
                            {text.fly.specs.map((spec: any, i: number) => (
                                <li key={i} className="flex items-center text-slate-300">
                                    <svg className="w-5 h-5 text-sky-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {spec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Container>
        </section>
    );
}
