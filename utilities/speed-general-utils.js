/**
 * Finds a value within a given range.
 * @see https://stackoverflow.com/questions/10807936/how-do-i-search-google-spreadsheets/10823543#10823543
 * @param {String} value The value to find.
 * @param {String} data The range to search in using Google's A1 format.
 * @return {Object} A range pointing to the first cell containing the value,
 *     or null if not found.
 */
exports.find = function find(value, data) {
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            if (data[i][j] == value) {
                const columnName = columnToName(j + 1);
                return { row: i + 1, column: columnName, columnNum: j + 1 };
            }
        }
    }
    return null;
}
/**
  * Ensures null cells don't mess with anything.
  * @param cell
  * @return {String} cell or ''
  */
exports.checkCell = function checkCell(cell) {
    if (cell === undefined || cell === null) {
        return '';
    }
    else {
        return cell;
    }
}
/**
 * Returns the Google Spreadsheet column name equivalent of a number.
 * @param {Integer} columnNumber The column number to look for
 * @return {String} columnName
 */
function columnToName(columnNumber) {
    let columnName = '';
    let modulo;
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    while (columnNumber > 0) {
        modulo = (columnNumber - 1) % 26;
        columnName = alpha.charAt(modulo) + columnName;
        columnNumber = Math.floor((columnNumber - modulo) / 26);
    }
    return columnName;
}