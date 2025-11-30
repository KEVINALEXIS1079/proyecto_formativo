import { Card, CardBody } from "@heroui/react";

interface Props {
  countLabel: string;
  count: number;
  areaM2: number;
}

export default function GeoMetrics({ countLabel, count, areaM2 }: Props) {
  const fmt = (n?: number) => (n ? n.toLocaleString("es-CO") : "0");
  const areaHa = areaM2 / 10000;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card shadow="sm" className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-content1 border border-blue-100 dark:border-blue-900/30">
        <CardBody className="flex flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{countLabel}</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{count}</p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
        </CardBody>
      </Card>

      <Card shadow="sm" className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-content1 border border-green-100 dark:border-green-900/30">
        <CardBody className="flex flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Área Total (m²)</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{fmt(areaM2)}</p>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full text-green-600 dark:text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          </div>
        </CardBody>
      </Card>

      <Card shadow="sm" className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-content1 border border-orange-100 dark:border-orange-900/30">
        <CardBody className="flex flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Área Total (ha)</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{fmt(areaHa)} ha</p>
          </div>
          <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full text-orange-600 dark:text-orange-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M13 21V7"/></svg>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
