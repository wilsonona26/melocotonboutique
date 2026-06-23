import { formatCurrency } from '../../utils/formatters';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface Props {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    monthlyRevenue: number;
  };
}

export default function SalesChart({ stats }: Props) {
  const cards: StatCard[] = [
    { label: 'Total Pedidos', value: String(stats.totalOrders), icon: '📦', color: 'bg-blue-50 text-blue-700' },
    { label: 'Ingresos Totales', value: formatCurrency(stats.totalRevenue), icon: '💰', color: 'bg-green-50 text-green-700' },
    { label: 'Pedidos Pendientes', value: String(stats.pendingOrders), icon: '⏳', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Ingresos Este Mes', value: formatCurrency(stats.monthlyRevenue), icon: '📈', color: 'bg-primary-50 text-primary-700' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.label} className={`rounded-2xl p-6 ${card.color.replace('text-', 'border-').replace('-700', '-200')} border bg-white`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${card.color.split(' ')[1]}`}>{card.value}</p>
            </div>
            <span className="text-3xl">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
