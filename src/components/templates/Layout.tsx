import React from 'react';
import { motion } from 'motion/react';
import { Music, Search, Filter, BookOpen, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-pearl">
      {/* Navbar Superior - O Altar da Aplicação */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-serene-blue px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gold p-2 rounded-lg shadow-sm">
              <Music className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-deep-blue">
              Louve<span className="text-gold">Flow</span>
            </h1>
          </div>

          {/* Versículo do Dia - Centralizado para foco espiritual */}
          <div className="hidden md:flex flex-col items-center max-w-md text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold mb-1">Versículo do Dia</span>
            <p className="bible-verse italic text-sm text-gray-600 leading-tight">
              "Deus é Espírito, e importa que os que o adoram o adorem em espírito e em verdade."
            </p>
            <span className="text-[10px] text-gray-400 mt-1">— João 4:24</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-serene-blue rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-500" />
            </button>
            <button className="md:hidden p-2">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {/* Sidebar de Filtros - Organização do Louvor */}
        <aside className="hidden md:block w-64 border-r border-serene-blue p-6 space-y-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold mb-4 flex items-center gap-2">
              <Filter className="w-3 h-3" /> Temática Espiritual
            </h3>
            <ul className="space-y-2 text-sm">
              {['Entrega Total', 'Arrependimento', 'Soberania', 'Gratidão', 'Guerra Espiritual'].map((item) => (
                <li key={item} className="cursor-pointer hover:text-gold transition-colors py-1">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold mb-4 flex items-center gap-2">
              <BookOpen className="w-3 h-3" /> Facilidade Técnica
            </h3>
            <ul className="space-y-2 text-sm">
              {['Iniciante (3-4 acordes)', 'Intermediário', 'Avançado'].map((item) => (
                <li key={item} className="cursor-pointer hover:text-gold transition-colors py-1">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Área Central - Onde o Louvor Acontece */}
        <main className="flex-1 p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Footer Simples */}
      <footer className="py-6 border-t border-serene-blue text-center text-[10px] text-gray-400 uppercase tracking-widest">
        Feito para a Glória de Deus • LouveFlow 2026
      </footer>
    </div>
  );
}
