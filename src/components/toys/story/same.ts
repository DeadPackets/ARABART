// "Everything inside this part", written in six tools a developer knows. Shared by the server render and the live tabs.
import { FIELDS, range } from '../key';

const pad = (x: number, w: number) => String(x).padStart(w, '0');
const ip = (k: number) => [24, 16, 8, 0].map(s => Math.floor(k / 2 ** s) % 256).join('.');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export interface View { id: string; name: string; stored: string; q: string; how: string }

export function views(v: number[], level: number): View[] {
  const { key, lo, hi } = range(v, level);
  const prefix = FIELDS.slice(0, level).reduce((s, f) => s + f[1], 0);
  const mask = ip(2 ** 32 - 2 ** (32 - prefix));
  const what = FIELDS.slice(0, level).map(([f], i) => `${f} ${v[i]}`).join(', ');
  const top = FIELDS[level - 1][0];
  const lt = ['n', 's', 'sl', 'c', 'p'].map((p, i) => p + v[i]);
  const sk = [['SHELF', 2], ['SLOT', 2], ['CARD', 2], ['PORT', 3]].map(([t, w], i) => `${t}#${pad(v[i + 1], w as number)}`);
  const below = FIELDS.slice(level).map(f => `${f[0]}s`);
  const n = (x: number) => x.toLocaleString('en-US');
  return [
    {
      id: 'key', name: 'His key', stored: `key = ${key}`,
      q: `WHERE key >= ${lo}\n  AND key <  ${hi}`,
      how: `One jump into a sorted index, to ${n(lo)}, then read forward. The keys are plain integers, so any database could index them in 2005, and numbers always sort in true order.`,
    },
    {
      id: 'ip', name: 'IP subnet', stored: `${ip(key)}`,
      q: `(${ip(key)} & ${mask})\n  == ${ip(lo)}\n// so it is inside ${ip(lo)}/${prefix}`,
      how: `An IPv4 address is a 32-bit number too, and a network is every address that starts with the same bits. In his key, ${what} is exactly the network ${ip(lo)}/${prefix}. Routers make this check for every packet.`,
    },
    {
      id: 'path', name: 'Materialized path', stored: `path = '/${v.join('/')}/'`,
      q: `WHERE path LIKE '/${v.slice(0, level).join('/')}/%'`,
      how: 'The same idea in text: the whole path sits in one column, and a prefix finds everything below it. Text compares letter by letter, so 10 sorts before 9 unless you pad the numbers. His fixed bit widths sort in true number order by design.',
    },
    {
      id: 'ltree', name: 'Postgres ltree', stored: `path = '${lt.join('.')}'`,
      q: `WHERE path <@ '${lt.slice(0, level).join('.')}'`,
      how: 'A Postgres data type made for paths. The &lt;@ operator means “is inside”, and a GiST index answers it without walking the tree level by level.',
    },
    {
      id: 'dynamo', name: 'DynamoDB', stored: `pk = 'NODE#${pad(v[0], 4)}'\nsk = '${sk.join('#')}'`,
      q: level === 1
        ? `KeyConditionExpression:\n  pk = :node\n:node = 'NODE#${pad(v[0], 4)}'`
        : `KeyConditionExpression:\n  pk = :node AND begins_with(sk, :pre)\n:node = 'NODE#${pad(v[0], 4)}'\n:pre  = '${sk.slice(0, level - 1).join('#')}#'`,
      how: 'Inside one partition, DynamoDB keeps items sorted by their sort key, so begins_with reads one stretch. The numbers are padded with zeros so that text order matches number order.',
    },
    {
      id: 'rec', name: 'Recursive query', stored: `parent_id = (the id of card ${v[3]})`,
      q: `WITH RECURSIVE inside AS (\n  SELECT id FROM part WHERE id = :${top}\n  UNION ALL\n  SELECT p.id FROM part p\n  JOIN inside i ON p.parent_id = i.id\n)\nSELECT * FROM inside;`,
      how: `One statement, but the database still works down one level at a time: first the ${below.join(', then the ')}. It is the level-by-level walk from the race above.`,
    },
  ].map(x => ({ ...x, stored: esc(x.stored), q: esc(x.q) }));
}
