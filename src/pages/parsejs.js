import { parse, isValid, format } from 'date-fns';

const dateStr = "Thursday, 10 April, 2025";
const parsedDate = parse(dateStr, "EEEE, d MMMM, yyyy", new Date());

console.log("Is valid:", isValid(parsedDate));
console.log("Parsed:", format(parsedDate, "yyyy-MM-dd")); // "2025-04-10"
