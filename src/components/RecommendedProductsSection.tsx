import { ShoppingBag, ExternalLink, Tag } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────
// COMO ADICIONAR OU EDITAR PRODUTOS
// Basta editar a lista abaixo. Cada produto vira um card automaticamente.
// - title: nome do produto
// - description: frase curta explicando o produto
// - imageUrl: link de uma imagem (pode usar a própria foto do produto na loja)
// - price: texto livre, ex: "R$ 129,90" ou "A partir de R$ 49"
// - affiliateLink: o SEU link de afiliado (não o link comum do produto!)
// - store: nome da loja/plataforma (aparece como selo no card)
// ─────────────────────────────────────────────────────────────────────────
interface RecommendedProduct {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: string;
  affiliateLink: string;
  store: string;
}

const RECOMMENDED_PRODUCTS: RecommendedProduct[] = [
  {
    id: 'exemplo-fone',
    title: 'Fone de Ouvido Bluetooth sem Fio',
    description: 'Cancelamento de ruído, bateria de longa duração e ótimo custo-benefício para o dia a dia.',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400',
    price: 'R$ 149,90',
    affiliateLink: 'https://www.amazon.com.br/s?k=fone+bluetooth&tag=SEU-ID-AQUI-20',
    store: 'Amazon'
  },
  {
    id: 'exemplo-cadeira',
    title: 'Cadeira de Escritório Ergonômica',
    description: 'Apoio lombar ajustável, ideal para quem passa horas trabalhando ou estudando em casa.',
    imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=400',
    price: 'R$ 599,00',
    affiliateLink: 'https://www.amazon.com.br/s?k=cadeira+escritorio+ergonomica&tag=SEU-ID-AQUI-20',
    store: 'Amazon'
  },
  {
    id: 'exemplo-hospedagem',
    title: 'Hospedagem de Site Hostgator',
    description: 'Quer criar seu próprio site ou loja online? Comece com um plano de hospedagem confiável.',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400',
    price: 'A partir de R$ 9,99/mês',
    affiliateLink: 'https://www.hostgator.com.br/?afiliado=SEU-ID-AQUI',
    store: 'Hostgator'
  }
];

export default function RecommendedProductsSection() {
  return (
    <div className="space-y-6" id="recommended-products-panel">
      <div className="flex items-center gap-3">
        <ShoppingBag className="w-6 h-6 text-emerald-400" />
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">Produtos Recomendados</h2>
          <p className="text-xs text-gray-500">
            Indicações selecionadas pela nossa equipe. Ao comprar por um destes links, você apoia o Bla, Bla, Amigos sem pagar nada a mais por isso.
          </p>
        </div>
      </div>

      {RECOMMENDED_PRODUCTS.length === 0 ? (
        <div className="bg-[#121225] border border-white/5 rounded-2xl p-10 text-center text-gray-500 text-sm">
          Nenhum produto cadastrado no momento. Volte em breve!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {RECOMMENDED_PRODUCTS.map(product => (
            <a
              key={product.id}
              href={product.affiliateLink}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group bg-[#121225] border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-400/40 transition-colors flex flex-col"
            >
              <div className="relative h-40 overflow-hidden bg-black/30">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-1 rounded-full flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {product.store}
                </span>
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-bold text-white text-sm leading-snug">{product.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed flex-1">{product.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  {product.price && (
                    <span className="text-emerald-400 font-extrabold text-sm">{product.price}</span>
                  )}
                  <span className="ml-auto text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ver oferta <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      <p className="text-[10px] text-gray-600 leading-relaxed border-t border-white/5 pt-4">
        Divulgação: alguns links desta página são links de afiliados. Isso significa que o Bla, Bla, Amigos
        pode receber uma pequena comissão por compras realizadas através deles, sem qualquer custo extra
        para você. Isso nos ajuda a manter a plataforma gratuita.
      </p>
    </div>
  );
}
