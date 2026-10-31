function List({ title, items, tone }) {
  if (!items?.length) return null;
  return (
    <section className={"panel " + (tone || "")}>
      <h2>{title}</h2>
      <ul>
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </section>
  );
}

export default function Result({ data, t }) {
  return (
    <div className="result">
      {data.summary && (
        <section className="panel">
          <h2>{t.summary}</h2>
          <p>{data.summary}</p>
        </section>
      )}
      {data.terms?.length > 0 && (
        <section className="panel">
          <h2>{t.terms}</h2>
          <dl>
            {data.terms.map((x, i) => (
              <div key={i}>
                <dt>{x.term}</dt>
                <dd>{x.explanation}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {data.medications?.length > 0 && (
        <section className="panel">
          <h2>{t.meds}</h2>
          {data.medications.map((m, i) => (
            <div key={i} className="med">
              <strong>{m.name}</strong>
              <span className="chip">{t.freq} : {m.frequency}</span>
              {m.notes && <div>{m.notes}</div>}
            </div>
          ))}
        </section>
      )}
      <List title={t.advice} items={data.advice} />
      <List title={t.seeDoctor} items={data.see_doctor} tone="alert" />
      <List title={t.missing} items={data.missing} />
    </div>
  );
}
