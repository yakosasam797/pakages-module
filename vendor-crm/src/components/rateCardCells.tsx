import { StackCell, StackLine } from "@paryatech/design-system";

function TabularPhrase({ text }: { text: string }) {
  const match = /^(\d+)\s+(.+)$/.exec(text);
  if (!match) return text;
  return (
    <>
      <span className="pt-mono">{match[1]}</span> {match[2]}
    </>
  );
}

export function RateCardValidityCell({
  range,
  note,
}: {
  range: string;
  note: string;
}) {
  return (
    <StackCell>
      <StackLine mono>{range}</StackLine>
      <StackLine muted>
        <TabularPhrase text={note} />
      </StackLine>
    </StackCell>
  );
}

export function RateCardCoverageCell({
  count,
  unit,
  detail,
}: {
  count: number;
  unit: string;
  detail: string;
}) {
  return (
    <StackCell>
      <StackLine>
        <span className="pt-mono">{count}</span>
        {` ${unit}`}
      </StackLine>
      <StackLine muted>
        <TabularPhrase text={detail} />
      </StackLine>
    </StackCell>
  );
}
