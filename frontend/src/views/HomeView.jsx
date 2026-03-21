import { Navigation } from "../components/Navigation";

export function HomeView({ setActiveTab }) {
    return (
        <div className="flex flex-col min-h-screen bg-surface pb-24">
            {/* Header Splash */}
            <div className="bg-primary text-white pt-8 pb-12 px-6 rounded-b-[40px] shadow-sm">
                <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
                    <span>⏱</span> WaitReward
                </h1>
                <p className="text-lg font-medium opacity-90">
                    Tu tiempo vale. Ahora lo demostramos.
                </p>
            </div>

            <div className="flex-1 px-4 -mt-6 flex flex-col gap-6">

                {/* Catálogo */}
                <div className="bg-white rounded-card shadow-sm p-5">
                    <h2 className="font-bold text-ink text-base mb-4">¿Qué podés canjear?</h2>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Card 1 */}
                        <div className="bg-surface rounded-xl p-4 flex flex-col justify-between aspect-square">
                            <span className="text-3xl mb-1">☕</span>
                            <div>
                                <h3 className="text-sm font-bold text-ink leading-tight">Café en local adherido</h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">En cualquier cafetería de la red</p>
                                <div className="mt-2 text-primary font-black">30 WP</div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-surface border-2 border-primary/20 rounded-xl p-4 flex flex-col justify-between aspect-square">
                            <span className="text-3xl mb-1">💊</span>
                            <div>
                                <h3 className="text-sm font-bold text-ink leading-tight">Descuento en farmacia</h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">Productos seleccionados</p>
                                <div className="mt-2 text-primary font-black">100 WP</div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-surface relative rounded-xl p-4 flex flex-col justify-between aspect-square">
                            <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                MÁS POPULAR
                            </div>
                            <span className="text-3xl mb-1">🧠</span>
                            <div>
                                <h3 className="text-sm font-bold text-ink leading-tight">Sesión de psicología</h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">Telemedicina</p>
                                <div className="mt-2 text-primary font-black">300 WP</div>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-surface rounded-xl p-4 flex flex-col justify-between aspect-square">
                            <span className="text-3xl mb-1">🩺</span>
                            <div>
                                <h3 className="text-sm font-bold text-ink leading-tight">Consulta interna</h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">Sin cargo adicional</p>
                                <div className="mt-2 text-primary font-black">500 WP</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comercios adheridos */}
                <div className="bg-white rounded-card shadow-sm p-5">
                    <h2 className="font-bold text-ink text-sm mb-3 text-center">Comercios adheridos</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Badge icon="💊" text="Farmacia Del Pueblo" />
                        <Badge icon="☕" text="Café Central" />
                        <Badge icon="🧠" text="Centro de Salud Mental" />
                        <Badge icon="🩺" text="Lab. Diagnóstico" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => setActiveTab("patient")}
                        className="w-full py-4 rounded-full bg-primary text-white font-bold text-base active:scale-95 transition-transform shadow-sm"
                    >
                        Soy paciente → Ver mis puntos
                    </button>

                    <button
                        onClick={() => setActiveTab("clinic")}
                        className="w-full py-4 rounded-full bg-white text-primary border-2 border-primary font-bold text-base active:scale-95 transition-transform"
                    >
                        Soy médico → Registrar atención
                    </button>

                    <button
                        onClick={() => setActiveTab("commerce")}
                        className="w-full py-4 rounded-full bg-surface text-gray-700 font-bold text-base active:scale-95 transition-transform"
                    >
                        Soy comercio → Ver mi dashboard
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center mt-4 mb-2">
                    <p className="text-[10px] text-gray-400 font-medium">
                        Powered by Avalanche ◆ Smart contracts auditados ◆ Hackathon 2026
                    </p>
                </div>

            </div>
        </div>
    );
}

function Badge({ icon, text }) {
    return (
        <div className="px-3 py-1.5 bg-surface text-ink text-xs font-semibold rounded-full flex items-center gap-1.5">
            <span>{icon}</span>
            <span>{text}</span>
        </div>
    );
}
