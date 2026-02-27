import Image from 'next/image';
import Link from 'next/link';
import { Gift, ArrowRight, CheckCircle, Users, Copy, Award, ShieldCheck, Zap } from 'lucide-react';

export const metadata = {
    title: 'Ajánló Program | VízVillanyFűtés - Szerezz 10.000 Ft bónuszt',
    description: 'Hívj meg egy szakembert a platformra és szerezz te is 10.000 Ft lebeszélhető extra kredit bónuszt!',
};

export default function ReferralProgramPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-slate-900 border-b border-vvm-blue-800">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/hero_bg.webp"
                        alt="Háttér"
                        fill
                        className="object-cover opacity-30 mix-blend-overlay"
                        quality={85}
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-vvm-blue-900/90 via-slate-900/95 to-slate-900/90 backdrop-blur-[2px]"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-vvm-yellow-400/20 to-amber-500/20 backdrop-blur-md border border-vvm-yellow-400/30 rounded-2xl px-6 py-3 mb-8 shadow-xl">
                        <div className="bg-vvm-yellow-400/30 p-2 rounded-xl">
                            <Gift className="w-6 h-6 text-vvm-yellow-400" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-vvm-yellow-400 font-black text-sm uppercase tracking-wider">Kreditgyűjtő Program</h4>
                            <p className="text-white font-medium">Hívd meg egy kollégádat!</p>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white font-heading mb-6 tracking-tight">
                        Szerezz Plusz <span className="text-transparent bg-clip-text bg-gradient-to-r from-vvm-yellow-400 to-amber-500">10.000 Ft*</span> Kreditet
                    </h1>

                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Tudsz egy jó szakembert, aki még nem regisztrált be hozzánk?
                        Ajánld neki a platformot, és a sikeres csatlakozása, majd adminisztrátori jóváhagyása után te <span className="text-vvm-yellow-400 font-bold">10.000 Ft*</span> lebeszélhető promóciós kredit bónuszt kapsz! Ő is megkapja a szokásos 10.000 Ft-os indulási jóváírását, tehát kicsit mindenki jól jár!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login?redirect=/dashboard"
                            className="inline-flex items-center justify-center bg-vvm-blue-600 hover:bg-vvm-blue-500 text-white font-bold text-lg py-4 px-8 rounded-xl gap-2 transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(29,78,216,0.3)]"
                        >
                            <span>Hivatkozási kód lekérése</span>
                            <Copy className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/csatlakozz-partnerkent#szakember_regisztracio"
                            className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg py-4 px-8 rounded-xl transition-colors gap-2"
                        >
                            <span>Még nem küldtek meghívót, de érdekel</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-heading mb-4">
                            Így működik az Ajánló Program
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Három egyszerű lépés választ el a garantált bónusz kreditől. Használjátok a platformot közösen!
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
                        {/* Connecting line for desktop */}
                        <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-vvm-blue-100 via-vvm-blue-300 to-vvm-blue-100 z-0"></div>

                        {[
                            {
                                step: '1',
                                title: 'Oszd meg a kódod',
                                description: 'Jelentkezz be a fiókodba, másold ki a saját ajánlói linkedet, és küldd el ismerősödnek.',
                                icon: <Copy className="w-6 h-6 text-vvm-blue-600" />
                            },
                            {
                                step: '2',
                                title: 'A kolléga regisztrál',
                                description: 'Az ismerősöd a linkeden keresztül sikeresen regisztrál, mint új szakember a platformon.',
                                icon: <Users className="w-6 h-6 text-emerald-600" />
                            },
                            {
                                step: '3',
                                title: 'Megkapod a bónuszt',
                                description: 'A meghívott kolléga fiókjának adminisztrátori aktiválása után a te egyenlegeden azonnal jóváíródik a sikeres ajánláshoz járó 10.000 Ft* promóciós kredit.',
                                icon: <Gift className="w-6 h-6 text-vvm-yellow-600" />
                            }
                        ].map((item, index) => (
                            <div key={index} className="relative z-10 bg-white rounded-2xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center mb-6 relative">
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-sm shadow-lg outline outline-2 outline-white">
                                        {item.step}
                                    </div>
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-vvm-blue-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 font-heading mb-4">
                            Gyakori Kérdések
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "Hány embert hívhatok meg a program keretében?",
                                a: "Nincs felső korlát! Akármennyi kollégát, ismerőst meghívhatsz, minden egyes újonnan, sikeresen csatlakozott és aktivált szakember után megkapod a 10.000 Ft kredit bónuszt."
                            },
                            {
                                q: "Mikor írják jóvá az egyenlegemen a bónuszt?",
                                a: "A bónusz akkor kerül automatikusan jóváírásra, amikor a meghívott szakember fiókja átesik a minőségbiztosítási ellenőrzésen és véglegesen aktiválásra kerül az adminisztrátorok által."
                            },
                            {
                                q: "A meghívott szakember is kap bónuszt?",
                                a: "Igen! Ő automatikusan megkapja a platformunkra belépő új szakembereknek a jóváhagyás után amúgy is járó 10.000 Ft-os kezdő kreditet (így motiváltabb is a csatlakozásra), te pedig az újabb 10.000 Ft* extra bónuszt kapod a sikeres ajánlásért."
                            },
                            {
                                q: "Hol találom meg a saját ajánlói linkemet?",
                                a: "A sikeres bejelentkezés után a 'Vezérlőpult' (Dashboard) felületeden, a 'Kreditgyűjtő Program' menüpont alatt találod a személyes megosztható linkedet."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                                <h4 className="font-bold text-slate-900 text-lg mb-2 flex gap-3">
                                    <ShieldCheck className="w-6 h-6 text-vvm-blue-600 flex-shrink-0" />
                                    {faq.q}
                                </h4>
                                <p className="text-slate-600 pl-9">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center border-t border-slate-200 py-6">
                        <p className="text-xs text-slate-500 max-w-2xl mx-auto mb-8">
                            *A 10.000 Ft promóciós (affiliate) kredit készpénzre vagy azonnali átutalásra nem váltható, kizárólag a platformon történő kapcsolatfelvételi adatok vásárlására (lead-feloldásra) használható fel az újonnan meghívott és csatlakozott szakember fiókjának sikeres adminisztrátori jóváhagyását követően. A szolgáltatás nyújtója a <Link href="/aszf" className="underline">Szabályzatban</Link> leírtak szerint fenntartja a promóció visszavonásának jogát visszaélés, fiktív adatok, regisztrációs duplikáció, vagy ügyfélpanaszok okán történt kizárás esetén.
                        </p>
                        <Link href="/csatlakozz-partnerkent" className="text-vvm-blue-600 hover:text-vvm-blue-800 font-semibold underline underline-offset-4">
                            További kérdésed van? Alapvető szakember belépési információk
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
