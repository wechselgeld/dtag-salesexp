'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ChevronDown } from 'lucide-react';
import { GlobalFooter } from '@/components/shared/global-footer';
import { ScreenHeader } from '@/components/shared/form/form-suite';

const SalesExperienceLogoOnlyText = () => (
	<svg
		width="260"
		height="90"
		viewBox="0 0 600 340"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		className="text-black mb-8"
		style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}
	>
		<g transform="translate(-355, 0)">
			<g transform="matrix(1,0,0,1,-15.137021,-21.241107)">
				<g>
					<g transform="matrix(1,0,0,1,370.224,139.51)">
						<path d="M39.846,2.433C58.856,2.433 73.912,-9.125 73.912,-29.504C73.912,-44.256 64.635,-55.51 49.427,-59.464L37.717,-62.658C32.09,-64.179 27.375,-66.764 27.375,-73.608C27.375,-80.452 32.698,-84.71 39.694,-84.71C47.602,-84.71 52.012,-80.908 53.229,-73.304L73.304,-73.304C71.327,-92.01 60.225,-104.025 39.694,-104.025C20.835,-104.025 6.387,-91.554 6.387,-72.239C6.387,-59.769 12.927,-48.058 29.048,-43.648L40.758,-40.302C48.667,-38.173 52.925,-34.979 52.925,-28.287C52.925,-21.748 48.514,-16.881 39.846,-16.881C32.242,-16.881 26.615,-20.227 24.942,-28.744L4.41,-28.744C6.235,-8.669 18.858,2.433 39.846,2.433Z" style={{ fill: 'currentColor' }} />
					</g>
					<g transform="matrix(1,0,0,1,482.461,139.51)">
						<g>
							<path d="M90.489,0L55.814,-101.591L35.283,-101.591L0.608,0L21.444,0L27.983,-19.771L63.114,-19.771L69.654,0L90.489,0ZM45.017,-71.935L45.929,-71.935L56.879,-38.781L34.219,-38.781L45.017,-71.935Z" style={{ fill: 'currentColor' }} />
							<g transform="matrix(1,0,0,1,126.078,0)">
								<path d="M66.46,0L66.46,-19.01L30.112,-19.01L30.112,-101.591L9.581,-101.591L9.581,0L66.46,0Z" style={{ fill: 'currentColor' }} />
								<path d="M113.149,-101.591L113.149,0L172.918,0L172.918,-19.01L133.68,-19.01L133.68,-42.127L171.397,-42.127L171.397,-61.137L133.68,-61.137L133.68,-82.581L172.918,-82.581L172.918,-101.591L113.149,-101.591Z" style={{ fill: 'currentColor' }} />
								<path d="M254.891,2.433C273.901,2.433 288.957,-9.125 288.957,-29.504C288.957,-44.256 279.68,-55.51 264.472,-59.464L252.762,-62.658C247.135,-64.179 242.42,-66.764 242.42,-73.608C242.42,-80.452 247.743,-84.71 254.739,-84.71C262.647,-84.71 267.057,-80.908 268.274,-73.304L288.349,-73.304C286.372,-92.01 275.27,-104.025 254.739,-104.025C235.88,-104.025 221.432,-91.554 221.432,-72.239C221.432,-59.769 227.972,-48.058 244.093,-43.648L255.803,-40.302C263.712,-38.173 267.97,-34.979 267.97,-28.287C267.97,-21.748 263.559,-16.881 254.891,-16.881C247.287,-16.881 241.66,-20.227 239.987,-28.744L219.455,-28.744C221.28,-8.669 233.903,2.433 254.891,2.433Z" style={{ fill: 'currentColor' }} />
							</g>
						</g>
					</g>
				</g>
			</g>
		</g>
		<g transform="translate(-355, 0)">
			<g transform="matrix(1,0,0,1,0,-3)">
				<g transform="matrix(125,0,0,125,405.336958,238.940939)">
					<path d="M0.42,-0.005C0.435,-0 0.453,-0.028 0.443,-0.046L0.286,-0.316C0.367,-0.432 0.446,-0.526 0.451,-0.538C0.445,-0.559 0.427,-0.585 0.403,-0.609C0.385,-0.627 0.376,-0.631 0.37,-0.631C0.362,-0.631 0.354,-0.626 0.331,-0.588L0.232,-0.429L0.231,-0.429L0.15,-0.584C0.129,-0.613 0.059,-0.661 0.037,-0.661C0.029,-0.661 0.018,-0.652 0.018,-0.641C0.018,-0.641 0.019,-0.623 0.039,-0.583L0.16,-0.342C0.083,-0.222 -0.004,-0.088 -0.012,-0.073C-0.001,-0.04 0.037,0.012 0.052,0.012C0.065,0.012 0.077,0.004 0.086,-0.011L0.221,-0.229L0.222,-0.228L0.319,-0.069C0.345,-0.036 0.384,-0.017 0.42,-0.005Z" style={{ fill: 'currentColor' }} />
				</g>
				<g transform="matrix(125,0,0,125,517.586958,238.940939)">
					<path d="M0.195,0.032C0.248,0.036 0.431,-0.078 0.437,-0.091C0.442,-0.11 0.427,-0.146 0.402,-0.174C0.394,-0.183 0.39,-0.186 0.38,-0.187C0.343,-0.191 0.217,-0.103 0.173,-0.105C0.155,-0.106 0.145,-0.125 0.145,-0.146C0.145,-0.159 0.146,-0.238 0.15,-0.273C0.232,-0.295 0.34,-0.33 0.349,-0.335C0.355,-0.352 0.337,-0.387 0.316,-0.415C0.308,-0.426 0.301,-0.434 0.288,-0.433C0.252,-0.43 0.201,-0.415 0.159,-0.404C0.16,-0.426 0.166,-0.49 0.169,-0.52C0.225,-0.541 0.323,-0.572 0.367,-0.585C0.381,-0.589 0.392,-0.593 0.394,-0.598C0.394,-0.609 0.377,-0.645 0.354,-0.676C0.341,-0.694 0.332,-0.702 0.307,-0.704C0.26,-0.708 0.12,-0.634 0.058,-0.608C0.055,-0.607 0.052,-0.604 0.052,-0.599C0.054,-0.587 0.066,-0.563 0.079,-0.547L0.062,-0.381C0.037,-0.371 0.02,-0.362 0.019,-0.346C0.018,-0.328 0.037,-0.308 0.054,-0.283C0.049,-0.229 0.047,-0.2 0.045,-0.162C0.043,-0.078 0.141,0.028 0.195,0.032Z" style={{ fill: 'currentColor' }} />
				</g>
				<g transform="matrix(125,0,0,125,627.961958,238.940939)">
					<path d="M0.104,0.017C0.121,0.017 0.14,-0.001 0.141,-0.028C0.15,-0.225 0.168,-0.39 0.181,-0.585C0.173,-0.624 0.124,-0.683 0.096,-0.683C0.08,-0.683 0.071,-0.676 0.07,-0.648C0.063,-0.47 0.032,-0.241 0.019,-0.085C0.022,-0.052 0.087,0.017 0.104,0.017Z" style={{ fill: 'currentColor' }} />
				</g>
				<g transform="matrix(125,0,0,125,704.086958,238.940939)">
					<path d="M0.114,-0.011C0.125,-0.006 0.14,-0.017 0.141,-0.03C0.144,-0.204 0.159,-0.389 0.161,-0.442L0.162,-0.442L0.328,-0.081C0.348,-0.048 0.417,0.009 0.447,0.009C0.458,0.009 0.476,-0 0.476,-0.021C0.476,-0.166 0.477,-0.45 0.481,-0.609C0.476,-0.643 0.407,-0.7 0.39,-0.7C0.379,-0.699 0.354,-0.68 0.355,-0.661C0.363,-0.516 0.364,-0.344 0.361,-0.239L0.36,-0.239L0.22,-0.579C0.206,-0.601 0.142,-0.667 0.108,-0.667C0.09,-0.667 0.068,-0.648 0.066,-0.635C0.042,-0.452 0.025,-0.23 0.027,-0.111C0.032,-0.076 0.075,-0.03 0.114,-0.011Z" style={{ fill: 'currentColor' }} />
				</g>
				<g transform="matrix(125,0,0,125,828.586958,238.940939)">
					<path d="M0.195,0.032C0.248,0.036 0.431,-0.078 0.437,-0.091C0.442,-0.11 0.427,-0.146 0.402,-0.174C0.394,-0.183 0.39,-0.186 0.38,-0.187C0.343,-0.191 0.217,-0.103 0.173,-0.105C0.155,-0.106 0.145,-0.125 0.145,-0.146C0.145,-0.159 0.146,-0.238 0.15,-0.273C0.232,-0.295 0.34,-0.33 0.349,-0.335C0.355,-0.352 0.337,-0.387 0.316,-0.415C0.308,-0.426 0.301,-0.434 0.288,-0.433C0.252,-0.43 0.201,-0.415 0.159,-0.404C0.16,-0.426 0.166,-0.49 0.169,-0.52C0.225,-0.541 0.323,-0.572 0.367,-0.585C0.381,-0.589 0.392,-0.593 0.394,-0.598C0.394,-0.609 0.377,-0.645 0.354,-0.676C0.341,-0.694 0.332,-0.702 0.307,-0.704C0.26,-0.708 0.12,-0.634 0.058,-0.608C0.055,-0.607 0.052,-0.604 0.052,-0.599C0.054,-0.587 0.066,-0.563 0.079,-0.547L0.062,-0.381C0.037,-0.371 0.02,-0.362 0.019,-0.346C0.018,-0.328 0.037,-0.308 0.054,-0.283C0.049,-0.229 0.047,-0.2 0.045,-0.162C0.043,-0.078 0.141,0.028 0.195,0.032Z" style={{ fill: 'currentColor' }} />
				</g>
				<g transform="matrix(1,0,0,1,355.087,238.941)">
					<path d="M21,-0.125C27.375,-0.125 46.125,-12 46.75,-13.25C47.125,-15.75 45.25,-21.625 43.5,-24.875C43,-26 42.375,-26.375 41.5,-26.375C38.875,-26.375 24.875,-16.5 18.375,-16.5C16.125,-16.5 14.875,-17.375 15,-19.25C15,-20.875 15.25,-30.625 16,-34.25C24.25,-36.625 38.5,-41.375 39.375,-41.875C40.125,-43.875 39.125,-48.625 36.875,-51.375C36.25,-52.125 35.375,-52.75 33.75,-52.75C29.875,-52.75 21.125,-49.875 16.625,-49C16.625,-51 16.875,-59 17.125,-61.625C24.125,-63.625 40.5,-69 47.375,-71C49.125,-71.5 50.5,-72.25 50.75,-72.875C50.625,-74.25 49.125,-78.875 47.875,-82.25C46.875,-84.625 46.125,-85.5 44.25,-85.5C37.625,-85.5 10.625,-76.625 0.125,-73.125C-0.25,-73 -0.625,-72.625 -0.625,-72.125C-0.625,-68.25 2.125,-63.625 5.25,-60.5L5.25,-46.625C1.125,-45.375 -0.5,-44.75 -0.5,-42.375C-0.5,-39.75 0.25,-38.25 3.375,-33.25C3.375,-30 2.875,-26.375 2.625,-20.125C2.125,-10.875 14.25,-0.125 21,-0.125Z" style={{ fill: 'currentColor' }} />
				</g>
				<g transform="matrix(1,0,0,1,466.212,238.941)">
					<path d="M15.625,2.375C16.5,2.375 17.625,0.75 17.75,0C17.875,-0.625 16.875,-20 17.25,-35.375L17.375,-35.375C18.75,-32.875 24.25,-27.875 26,-27.875C36.25,-27.875 51.875,-41.75 52.125,-54.75C52.5,-72.5 40.625,-85 24,-85C14.625,-85 1.125,-79.75 -1.75,-76.5C-2,-74.375 0.125,-70.75 4.875,-65.125C4.5,-48.375 4.375,-23.75 4.375,-7.75C4.375,-4.75 13.125,2.375 15.625,2.375ZM16.875,-41.75C17.25,-49.875 17.625,-61.875 17.75,-67.875C23.375,-69.5 27.75,-70.375 31.125,-70.375C36.875,-70.375 40.25,-66.25 40,-61.875C39.5,-52.5 28.25,-44.25 16.875,-41.75Z" style={{ fill: 'currentColor' }} />
					<path d="M138.625,-32.375C155.375,-42.875 164.5,-54.125 164.25,-63.875C163.75,-75.75 148.5,-92.625 135.5,-92.125C122.875,-91.75 109.625,-82.875 105.5,-76.125C105.625,-73 110.25,-66.75 112.75,-66C111.125,-49.75 110.875,-26.25 109.875,-9.5C110.375,-7.125 117.75,-0.375 119.875,-0.125C122.375,0 123.75,-2.125 123.875,-4.125C124.25,-9.625 125,-16.5 125.125,-26.5C135.875,-18 152.875,-1.375 159,3.375C160.5,4.375 163.625,2.5 164,0.75C164.25,-1 160.875,-9.625 159.625,-10.875C153.875,-17.25 144.25,-27 138.625,-32.375ZM139.75,-76C144.25,-76.25 147.125,-73.5 147.375,-68.5C148.125,-57 137.125,-46.25 126.25,-41C126.75,-52.625 127.25,-63 126.625,-71.75C129.5,-73.375 134.875,-75.875 139.75,-76Z" style={{ fill: 'currentColor' }} />
					<path d="M211.75,-0.125C218.125,-0.125 236.875,-12 237.5,-13.25C237.875,-15.75 236,-21.625 234.25,-24.875C233.75,-26 233.125,-26.375 232.25,-26.375C229.625,-26.375 215.625,-16.5 209.125,-16.5C206.875,-16.5 205.625,-17.375 205.75,-19.25C205.75,-20.875 206,-30.625 206.75,-34.25C215,-36.625 229.25,-41.375 230.125,-41.875C230.875,-43.875 229.875,-48.625 227.625,-51.375C227,-52.125 226.125,-52.75 224.5,-52.75C220.625,-52.75 211.875,-49.875 207.375,-49C207.375,-51 207.625,-59 207.875,-61.625C214.875,-63.625 231.25,-69 238.125,-71C239.875,-71.5 241.25,-72.25 241.5,-72.875C241.375,-74.25 239.875,-78.875 238.625,-82.25C237.625,-84.625 236.875,-85.5 235,-85.5C228.375,-85.5 201.375,-76.625 190.875,-73.125C190.5,-73 190.125,-72.625 190.125,-72.125C190.125,-68.25 192.875,-63.625 196,-60.5L196,-46.625C191.875,-45.375 190.25,-44.75 190.25,-42.375C190.25,-39.75 191,-38.25 194.125,-33.25C194.125,-30 193.625,-26.375 193.375,-20.125C192.875,-10.875 205,-0.125 211.75,-0.125Z" style={{ fill: 'currentColor' }} />
					<path d="M339.25,0.125C352.75,0.125 361.125,-15.5 361.125,-22C361.125,-24.375 354.75,-32.875 350.75,-32.875C349,-32.875 348,-31.625 347.5,-29.75C345.125,-21.125 338.625,-14.125 332.125,-14.125C327.25,-14.125 322.25,-18.625 322.25,-32.875C322.25,-55.5 335.375,-70.25 344.5,-70.25C348.25,-70.25 349.25,-67.375 349.625,-55.875C349.875,-50.5 359.75,-48.5 359.75,-53.25C359.75,-71.375 353.75,-87.25 341.25,-87.25C323.375,-87.25 306.5,-65.5 306.5,-39C306.5,-19.125 322.5,0.125 339.25,0.125Z" style={{ fill: 'currentColor' }} />
				</g>
			</g>
		</g>
	</svg>
);

const FaqItem = ({ question, answer }: { question: string; answer: React.ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<div className="border-b border-[#eaedf0] last:border-0 py-3">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex w-full items-center justify-between text-left focus:outline-none group"
			>
				<span className="font-semibold text-[#222] text-[0.95rem] group-hover:text-black transition-colors">{question}</span>
				<motion.div
					animate={{ rotate: isOpen ? 180 : 0 }}
					transition={{ duration: 0.2 }}
					className="text-[#888] ml-4 flex-shrink-0"
				>
					<ChevronDown className="w-4 h-4" />
				</motion.div>
			</button>
			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden"
					>
						<div className="pt-3 text-[0.9rem] text-[#555] leading-relaxed pb-2">
							{answer}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default function ShutdownClient() {
	return (
		<div className="h-screen w-full py-12 px-4 selection:bg-black/10 selection:text-black scrollbar-none overflow-y-auto overflow-x-hidden fixed inset-0 bg-[#f7f8fa]">
			<div className="max-w-3xl mx-auto">
				{/* Top Branding */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex flex-col items-center mb-10 text-center"
				>
					<SalesExperienceLogoOnlyText />
				</motion.div>

				{/* Elevated Premium Card matching Onboarding */}
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] overflow-hidden relative"
				>
					<div className="p-8 sm:p-12">
						<motion.div
							initial={{ opacity: 0, x: 15 }}
							animate={{ opacity: 1, x: 0 }}
							className="space-y-6 w-full"
						>
							<ScreenHeader
								icon={<ShieldAlert className="w-5 h-5 text-black" />}
								title="Anwendung gesperrt"
								subtitle="Dieses System wurde deaktiviert."
								iconBgClassName="bg-black/5"
							/>

							<div className="text-[0.98rem] text-[#444] leading-relaxed text-left pt-2 space-y-4 font-sans">
								<p>
									Der Betrieb der Plattform <strong>Sales Experience (SXP)</strong> musste auf Anweisung mit sofortiger Wirkung dauerhaft eingestellt werden.
								</p>
								<p>
									<strong>Verbleib aller Daten:</strong> Sämtliche aktiven Nutzersitzungen wurden serverseitig beendet. Alle temporären Datenbank-Verbindungen und Session-Verifizierungen wurden deaktiviert. Alle personenbezogenen Daten sowie Nutzerprofile wurden vollständig gelöscht. Es findet keine weitere Datenverarbeitung statt.
								</p>
								<p>
									Für Rückfragen oder Auskunftsbegehren stehen ausschließlich die im Impressum hinterlegten Ansprechpartner zur Verfügung.
								</p>
							</div>

							{/* FAQ Section */}
							<div className="pt-6 mt-6 border-[#eaedf0]">
								<h3 className="text-lg font-bold text-black mb-4 font-sans tracking-tight">Häufig gestellte Fragen (FAQ)</h3>
								<div className="flex flex-col">
									<FaqItem
										question="Warum wurde die Plattform abgeschaltet?"
										answer="Auf Anweisung von HR & dem BR wurde der Betrieb der Plattform SXP mit sofortiger Wirkung dauerhaft beendet."
									/>
									<FaqItem
										question="Was passiert mit meinen hinterlegten Daten?"
										answer="Sämtliche personenbezogenen Profile, Zugangsdaten und Sitzungen wurden vollständig und unwiderruflich gelöscht. Eine Wiederherstellung ist nicht möglich."
									/>
									<FaqItem
										question="Kann ich noch auf meine gespeicherten Dokumente zugreifen?"
										answer="Nein. Durch die sofortige Abschaltung ist kein Zugriff auf zuvor generierte Dokumente, Links oder Accounts mehr möglich."
									/>
								</div>
							</div>
						</motion.div>
					</div>
				</motion.div>

				{/* Marketing Banner */}
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
					className="relative overflow-hidden mt-6 bg-[#0a0a0a] rounded-3xl p-6 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-center justify-between border border-[#1a1a1a] shadow-2xl"
					style={{ fontFamily: "'Syne', var(--font-syne), sans-serif" }}
				>
					{/* Animated Background */}
					<div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden rounded-3xl">
						<motion.div
							animate={{
								scale: [1, 1.4, 1],
								opacity: [0.15, 0.35, 0.15],
								x: ['-20%', '20%', '-20%'],
							}}
							transition={{
								duration: 8,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
							className="w-[120%] h-[120%] sm:w-[80%] sm:h-[150%] rounded-[100%] bg-[#ccff00] blur-[70px]"
						/>
					</div>

					<div className="relative z-10 flex flex-col mb-5 sm:mb-0 text-center sm:text-left">
						<span
							className="text-xl tracking-tight text-white"
							style={{ fontFamily: "'Syne', var(--font-syne), sans-serif", fontWeight: 800 }}
						>
							SXP war ein Produkt von Buff.
						</span>
						<span
							className="text-sm text-[#888] mt-1 tracking-normal"
							style={{ fontFamily: "'Syne', var(--font-syne), sans-serif", fontWeight: 400 }}
						>
							Deine Website auf Autopilot. Vollkommen ohne Kopfschmerzen.
						</span>
					</div>
					<a
						href="https://buffinteractive.net/de"
						target="_blank"
						rel="noopener noreferrer"
						className="relative z-10 overflow-hidden group bg-[#ccff00] text-[#0a0a0a] px-6 py-3 rounded-full text-[0.95rem] hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
						style={{ fontFamily: "'Syne', var(--font-syne), sans-serif", fontWeight: 700 }}
					>
						<span className="relative z-10">buffinteractive.net ↗</span>
						<motion.div
							className="absolute top-0 left-[-150%] w-full h-full z-20 bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12"
							animate={{
								left: ['-150%', '150%', '150%'],
							}}
							transition={{
								duration: 4,
								times: [0, 0.2, 1],
								repeat: Infinity,
								ease: 'easeInOut',
								delay: 1,
							}}
						/>
					</a>
				</motion.div>

				<GlobalFooter className="pt-8 pb-0 mt-4 text-[#bbb]" linkColor="text-[#bbb]" />
			</div>
		</div>
	);
}
