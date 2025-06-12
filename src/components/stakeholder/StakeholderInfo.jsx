import React from 'react';

const matrix1 = [
  {
    quadrant: 'Blockers',
    why: 'High power, negative (or conflicting) interest – can stop or stall the initiative if ignored.',
    example: 'A compliance lead who fears the project breaches data-privacy rules.',
  },
  {
    quadrant: 'Drivers',
    why: 'High power, positive interest – sponsor or champion who pushes resources and decisions forward.',
    example: 'The VP who funded the project and wants rapid market rollout.',
  },
  {
    quadrant: 'Bystanders',
    why: 'Low power, low interest – barely affected and unlikely to act unless the change touches them.',
    example: 'Admin staff in another region who won’t use the new system.',
  },
  {
    quadrant: 'Defenders',
    why: 'Low power, positive interest – enthusiastic supporters who will advocate but can’t sway big decisions.',
    example: 'Front-line users eager for better tooling, happy to test and give feedback.',
  },
];

const matrix2 = [
  {
    quadrant: 'Keep Satisfied',
    why: 'High power, low interest – meet their needs early so they stay neutral, not hostile.',
    example: 'Corporate legal team: wants assurance on compliance but otherwise uninvolved.',
  },
  {
    quadrant: 'Manage Closely',
    why: 'High power, high interest – engage daily, involve in key choices; success hinges on them.',
    example: 'Product sponsor whose budget, KPIs and reputation ride on the rollout.',
  },
  {
    quadrant: 'Monitor',
    why: 'Low power, low interest – minimal effort; send occasional updates just in case priorities shift.',
    example: 'Back-office staff in a non-impacted department.',
  },
  {
    quadrant: 'Keep Informed',
    why: 'Low power, high interest – communicate regularly; they supply insight and grassroots support.',
    example: 'Power users keen to pilot features and spread positive word.',
  },
];

export default function StakeholderInfo() {
  const renderTable = (title, rows) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse text-sm">
        <caption className="text-left font-medium mb-2">{title}</caption>
        <thead>
          <tr>
            <th className="border px-2 py-1">Quadrant</th>
            <th className="border px-2 py-1">One-line “why it matters”</th>
            <th className="border px-2 py-1">Quick example for assigning</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.quadrant}>
              <td className="border px-2 py-1 font-semibold whitespace-nowrap">
                {row.quadrant}
              </td>
              <td className="border px-2 py-1">{row.why}</td>
              <td className="border px-2 py-1">{row.example}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="stakeholder-info mb-8">
      {renderTable(
        'Matrix 1 — Blockers · Drivers · Bystanders · Defenders',
        matrix1
      )}
      {renderTable(
        'Matrix 2 — Keep Satisfied · Manage Closely · Monitor · Keep Informed',
        matrix2
      )}
    </div>
  );
}
