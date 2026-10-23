import type { Term } from '../glossary';

// Terms for the career and patents pages
export default {
  api: {
    term: 'API',
    short: 'The set of functions one program offers to other programs, with names and inputs that stay the same, so others can build on them.',
    now: 'The same word today. It often means a web API over HTTP.',
  },
  thread: {
    term: 'Thread',
    short: 'A separate line of work inside one program. Two threads run at the same time, so a program can print in the background while you keep typing.',
    now: 'Still the same. Async code and worker pools run on threads.',
  },
  'pocket-pc': {
    term: 'Pocket PC / Windows Mobile',
    short: 'Microsoft’s system for handheld computers and, later, smartphones, from 2000 to about 2010. Apps were installed from small CAB files.',
    now: 'iOS and Android took its place.',
  },
  'today-screen': {
    term: 'Today screen',
    short: 'The home screen of a Pocket PC. Small plug-ins each added one line to it: the date, your next meeting, new messages.',
    now: 'Home-screen widgets on iOS and Android.',
  },
  shareware: {
    term: 'Shareware',
    short: 'Try before you buy. The full program runs for a trial period (15 days for DinarSoft), then asks for an unlock key that you buy from the maker.',
    now: 'A free trial, or a free app with an in-app purchase.',
  },
  'hijri-calendar': {
    term: 'Hijri calendar',
    short: 'The Islamic calendar. Each month starts with the new crescent moon, so a year has about 354 days.',
    now: 'Built into every browser: Intl.DateTimeFormat with the islamic-umalqura calendar.',
  },
  corba: {
    term: 'CORBA',
    short: 'A 1990s standard for calling a method on an object that lives in another program, on another machine, written in another language. One interface file describes every call.',
    now: 'gRPC does the same job today. A REST API with an OpenAPI file is its looser cousin.',
  },
  idl: {
    term: 'IDL',
    short: 'Interface Definition Language: a small file that lists an interface’s calls and data types, and nothing else. A compiler turns it into client and server code for C++, Java and more.',
    now: 'A .proto file for gRPC, or an OpenAPI file for REST.',
  },
  orb: {
    term: 'ORB',
    short: 'Object Request Broker: the CORBA library inside each program. It finds the remote object, packs the call into bytes, sends it over the network and unpacks the answer.',
    now: 'The gRPC runtime and the code it generates.',
  },
  'event-channel': {
    term: 'Event channel',
    short: 'A middleman for events. A sender puts an event in once; the channel hands a copy to every receiver that listens. Senders and receivers never need to know each other.',
    now: 'A Kafka topic, or a pub/sub topic in the cloud.',
  },
  tmn: {
    term: 'TMN',
    short: 'Telecommunications Management Network: the international framework for running telecom networks in layers, from single devices up to services and business.',
    now: 'Operators still use its layer names.',
  },
  cmip: {
    term: 'CMIP',
    short: 'The telecom industry’s own protocol for reading, changing, creating and deleting the parts of a network, and for receiving their alarms.',
    now: 'NETCONF or gNMI, with data described in YANG.',
  },
  gdmo: {
    term: 'GDMO',
    short: 'The telecom notation that describes one kind of equipment: what you can read, what you can set, what it can do, and which alarms it sends.',
    now: 'A YANG module.',
  },
  'managed-object': {
    term: 'Managed object',
    short: 'The software view of one part of the network, such as a shelf, a card or a port. It has settings you can read and change, actions you can run, and events it reports.',
    now: 'One node in a YANG data tree.',
  },
  nms: {
    term: 'Network manager (NMS)',
    short: 'The control-room software for a whole network of switches and routers. It keeps the inventory, shows the alarms and sets up connections.',
    now: 'A network controller, with telemetry and alarm dashboards.',
  },
  oss: {
    term: 'OSS',
    short: 'Operations support system: a phone company’s own back-office software for orders, billing, inventory and faults. It tells the network managers what to do.',
    now: 'Still called OSS/BSS. Modern ones talk to the network over REST or gRPC.',
  },
  ossi: {
    term: 'OSS interface',
    short: 'The published door in a network manager that a phone company’s own systems use to read alarms and inventory and to order changes.',
    now: 'The public API of a network controller.',
  },
  jidm: {
    term: 'JIDM',
    short: 'Joint Inter-Domain Management: a set of rules for turning telecom’s own equipment descriptions into CORBA interfaces, and for translating calls between the two while the system runs.',
    now: 'Code generated from a schema, plus a gateway between two protocols, such as grpc-gateway.',
  },
  'patent-claim': {
    term: 'Claim (patent)',
    short: 'The numbered sentences at the end of a patent. They say exactly what the patent protects; the rest of the text explains and gives examples.',
  },
  'prior-art': {
    term: 'Prior art',
    short: 'Everything published before a patent was filed. A patent covers what is new compared with it.',
  },
  'relational-database': {
    term: 'Relational database',
    short: 'Data kept in tables of rows and columns. Rows in different tables are linked by matching keys, and you ask questions in SQL.',
    now: 'PostgreSQL, MySQL, SQL Server and SQLite all work this way.',
  },
  'primary-key': {
    term: 'Primary key',
    short: 'The column whose value names one row and no other row in its table, like a user id.',
  },
  'foreign-key': {
    term: 'Foreign key',
    short: 'A column that holds another row’s key, to say “this belongs to that”. A reply can hold the id of the comment it answers; a port can hold the id of its card.',
  },
  'sql-join': {
    term: 'Join',
    short: 'A SQL step that matches the rows of two tables on a key. Following a chain of parents (port to card to shelf) takes one join for each step.',
  },
  'db-index': {
    term: 'Index (database)',
    short: 'A sorted copy of a column with pointers back to the rows, usually a B-tree. The database jumps straight to a value, or to the start of a range, without reading the whole table.',
  },
  'range-scan': {
    term: 'Range scan',
    short: 'Reading an index from a start value to an end value. The index is sorted, so every match sits in one unbroken stretch: one jump, then read forward.',
  },
  'bit-field': {
    term: 'Bit field',
    short: 'A group of bits inside a bigger number that holds its own small value. One 32-bit number can carry several of them side by side.',
    now: 'IPv4 addresses, network packet headers and Snowflake ids all pack fields this way.',
  },
  'recursive-cte': {
    term: 'Recursive query',
    short: 'A SQL query (WITH RECURSIVE) that repeats a join until it reaches the bottom of a tree. You write it once, but the database still works one level at a time.',
  },
  'materialized-path': {
    term: 'Materialized path',
    short: 'Storing the full path from the top in each row as text, such as /5/2/3/. “Everything under /5/2/” is then a prefix search on an index.',
  },
  'nested-sets': {
    term: 'Nested sets',
    short: 'Numbering a tree by walking around it: each row gets a left and a right number, and every row inside it gets numbers between those two.',
  },
  'closure-table': {
    term: 'Closure table',
    short: 'An extra table with one row for every ancestor and descendant pair. “Everything under X” is one lookup on the ancestor column.',
  },
  ltree: {
    term: 'ltree',
    short: 'A Postgres data type for paths such as n5.s2.sl3. The <@ operator means “is inside”, and a GiST index answers it fast.',
  },
  hierarchyid: {
    term: 'hierarchyid',
    short: 'A SQL Server data type that stores a row’s place in a tree in a short binary form. Sort by it, and each branch sits together.',
  },
  ordpath: {
    term: 'ORDPATH',
    short: 'A way to label the nodes of a tree so the labels sort in tree order and always leave room to insert a new node between two others. SQL Server’s hierarchyid is built on it.',
  },
  dynamodb: {
    term: 'DynamoDB',
    short: 'Amazon’s managed key-value database. Each item has a partition key and an optional sort key, and inside one partition the items are kept in sort-key order.',
  },
  'sort-key': {
    term: 'Sort key',
    short: 'In DynamoDB, the second part of an item’s key. A query can read a range of sort keys, or every sort key that begins with a prefix.',
  },
  cidr: {
    term: 'IP subnet',
    short: 'The /16 in 10.1.0.0/16: the first 16 bits name the network, the rest name machines inside it. “Is this address in that network?” is one comparison on a 32-bit number.',
  },
  cli: {
    term: 'CLI (command line)',
    short: 'Typed text commands to a device. Each router maker has its own commands, and they can change from one software release to the next.',
  },
  tl1: {
    term: 'TL1',
    short: 'Transaction Language 1: a plain-text command language for telecom equipment.',
  },
  netconf: {
    term: 'NETCONF',
    short: 'A protocol to read and change a device’s settings as structured data, all at once: the whole change is applied, or none of it.',
  },
  yang: {
    term: 'YANG',
    short: 'The language that describes a device’s settings and state as a typed tree. NETCONF, RESTCONF and gNMI all carry data described in YANG.',
  },
  jinja: {
    term: 'Jinja',
    short: 'A Python template language: text with {{ blanks }} that becomes a finished file when you fill in the values. Ansible uses it to write device settings.',
  },
  ansible: {
    term: 'Ansible',
    short: 'An open-source automation tool. It runs ordered tasks on many machines or network devices, often filling Jinja templates to make their settings.',
  },
  webhook: {
    term: 'Webhook',
    short: 'A call that a service makes to your URL when something happens, so you never have to keep asking.',
  },
} satisfies Record<string, Term>;
