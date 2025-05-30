import { PieChart, Pie, Cell } from "recharts";

const data = [
  { name: "Earnings on perfect trips", value: 60 },
  { name: "Future earnings", value: 25 },
  { name: "Reimbursements", value: 10 },
  { name: "Lost income", value: 5 },
];

const COLORS = [
  "#6b00d7", // Earnings
  "#955cf7", // Future
  "#bca9f5", // Reimbursements
  "#7da1ff", // Lost income
];

export const AdminGeneralDonutChart = () => (
  <div className="mx-auto flex rounded-xl bg-[#181628] p-6">
    <PieChart width={450} height={250}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={75}
        outerRadius={120}
        startAngle={90}
        endAngle={-270}
        dataKey="value"
        cornerRadius={10} // закруглённые углы
        paddingAngle={4} // зазоры между сегментами
        // stroke="#181628" // бордер — цвет фона
        strokeWidth={0} // бордер — ширина
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
    <ul className="mt-6 space-y-2 text-sm">
      {data.map((entry, index) => (
        <li key={entry.name} className="flex items-center">
          <span
            className="mr-2 inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: COLORS[index % COLORS.length] }}
          />
          <span>
            {entry.value}% {entry.name}
          </span>
        </li>
      ))}
    </ul>
  </div>
);
