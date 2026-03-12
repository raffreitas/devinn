const ical = require('node-ical');
const path = require('node:path');

function printUsage() {
	console.log('Uso: node index.js <url-ou-arquivo.ics>');
	console.log('Exemplo: node index.js https://exemplo.com/calendario.ics');
}

function normalizeEvent(event) {
	return {
		id: event.uid,
		summary: event.summary ?? null,
		description: event.description ?? null,
		location: event.location ?? null,
		start: event.start?.toISOString?.() ?? null,
		end: event.end?.toISOString?.() ?? null,
		status: event.status ?? null,
		organizer: event.organizer ?? null,
		attendees: Array.isArray(event.attendee)
			? event.attendee
			: event.attendee
				? [event.attendee]
				: [],
		url: event.url ?? null,
	};
}

async function loadCalendar(source) {
	if (/^https?:\/\//i.test(source)) {
		return ical.async.fromURL(source);
	}

	const filePath = path.resolve(process.cwd(), source);

	return ical.async.parseFile(filePath);
}

async function main() {
	const source = process.argv[2];

	if (!source) {
		printUsage();
		process.exitCode = 1;
		return;
	}

	try {
		const calendar = await loadCalendar(source);
		const events = Object.values(calendar)
			.filter((entry) => entry.type === 'VEVENT')
			.map(normalizeEvent)
			.sort((left, right) => {
				if (!left.start && !right.start) {
					return 0;
				}

				if (!left.start) {
					return 1;
				}

				if (!right.start) {
					return -1;
				}

				return left.start.localeCompare(right.start);
			});

		console.log(JSON.stringify({ source, total: events.length, events }, null, 2));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Falha ao carregar o feed iCal: ${message}`);
		process.exitCode = 1;
	}
}

main();
