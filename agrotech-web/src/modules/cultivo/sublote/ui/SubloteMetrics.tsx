import { Card, CardBody } from "@heroui/react";

type Props = {
  total: number;
  totalArea: number;
  promedioArea: number;
};

export default function SubloteMetrics({ total, totalArea, promedioArea }: Props) {
  const fmt = (n?: number) => (n ? n.toLocaleString("es-CO") : "—");

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <Card shadow="sm">
        <CardBody>
          <p>Total de sublotes</p>
          <p className="text-xl font-semibold">{total}</p>
        </CardBody>
      </Card>

      <Card shadow="sm">
        <CardBody>
          <p>Área total (m²)</p>
          <p className="text-xl font-semibold">{fmt(totalArea)}</p>
        </CardBody>
      </Card>

      <Card shadow="sm">
        <CardBody>
          <p>Área promedio (m²)</p>
          <p className="text-xl font-semibold">{fmt(promedioArea)}</p>
        </CardBody>
      </Card>
    </div>
  );
}
