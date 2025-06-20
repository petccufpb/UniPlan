"use client";
import { useStudentStore } from "@context/store";
import disciplines from "@public/data/disciplines.json";
import { Card } from "actify";

export default function Planejador() {
  const { periodos, setPeriodos } = useStudentStore(state => state);

  return (
    <main className="flex flex-col gap-12">
      <div>
        {periodos.map((_periodo, i) => (
          <Card key={i} variant="outlined">
            span
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {disciplines.map(discipline => (
          <Card key={discipline.id} className="px-4 py-2" variant="outlined">
            {discipline.name}
          </Card>
        ))}
      </div>
    </main>
  );
}
