"use client";

import { useEffect, useMemo, useState } from "react";

type TrendsPayload = {
    updatedAt: string;
    years: number[];
    series: {
        key: string;
        label: string;
        topic: { id: string; name: string };
        points: { year: number; count: number }[];
    }[];
};

function formatNumber(n: number) {
    return new Intl.NumberFormat("ko-KR").format(n);
}

export default function OpenAlexTrendsSection(props: { initial?: TrendsPayload }) {
    const [data, setData] = useState<TrendsPayload | null>(props.initial ?? null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (data) return;

        fetch("/api/trends/openalex", { method: "GET" })
            .then(async (r) => {
                if (!r.ok) throw new Error(await r.text());
                return (await r.json()) as TrendsPayload;
            })
            .then(setData)
            .catch((e) => setError(e instanceof Error ? e.message : "failed"));
    }, [data]);

    const maxCount = useMemo(() => {
        if (!data) return 0;
        let m = 0;
        for (const s of data.series) {
            for (const p of s.points) m = Math.max(m, p.count);
        }
        return m;
    }, [data]);

    return (
        <section className="w-full max-w-5xl mx-auto px-6 py-14">
            <h2 className="text-2xl font-semibold text-white">글로벌 트렌드 차트</h2>
            <p className="text-sm text-white/70 mt-2">
                OpenAlex 기반 키워드 관심도 추세(연도별 연구 산출량). 업데이트 {data?.updatedAt ? new Date(data.updatedAt).toLocaleString("ko-KR") : "-"}
            </p>

            {error ? (
                <div className="mt-6 text-red-300 text-sm">{error}</div>
            ) : null}

            {!data ? (
                <div className="mt-6 text-white/70 text-sm">불러오는 중 ({error ? "오류 발생" : "Data Fetching..."})</div>
            ) : (
                <div className="mt-8 space-y-10">
                    {data.series.map((s) => (
                        <div key={s.key} className="rounded-xl border border-white/10 p-5 bg-white/5">
                            <div className="flex flex-col gap-1">
                                <div className="text-lg font-semibold text-white">{s.label}</div>
                                <div className="text-xs text-white/60">
                                    Topic {s.topic.name}
                                </div>
                            </div>

                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-[720px] w-full text-sm">
                                    <thead>
                                        <tr className="text-white/70">
                                            {data.years.map((y) => (
                                                <th key={y} className="text-left font-medium py-2 pr-4">{y}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="align-bottom">
                                            {s.points.map((p) => {
                                                const h = maxCount ? Math.round((p.count / maxCount) * 80) : 0;
                                                return (
                                                    <td key={p.year} className="py-2 pr-4">
                                                        <div className="h-[90px] flex items-end">
                                                            <div
                                                                className="w-6 rounded-md bg-white/70"
                                                                style={{ height: `${h}px` }}
                                                                title={`${p.year}: ${formatNumber(p.count)}`}
                                                            />
                                                        </div>
                                                        <div className="mt-2 text-xs text-white/80">
                                                            {formatNumber(p.count)}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 text-xs text-white/60">
                                이 차트는 “컨설팅 의사결정에 영향 주는 글로벌 관심도”의 참고 지표로 사용됩니다.
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}