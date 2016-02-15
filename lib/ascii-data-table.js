'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var getArray = function getArray(len) {
  return Array.apply(null, Array(len)).map(function (_, i) {
    return i;
  });
};

var stringifyVal = function stringifyVal(val) {
  if (Array.isArray(val)) return stringifyArray(val);
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return val;
  if (val === null) return '(null)';
  if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') return stringifyObject(val);
};

var stringifyArray = function stringifyArray(arr) {
  return '[' + arr.map(stringifyVal).join(', ') + ']';
};

var stringifyObject = function stringifyObject(obj) {
  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return obj;
  return '{' + Object.keys(obj).map(function (key) {
    return key + ': ' + stringifyVal(obj[key]);
  }).join(', ') + '}';
};

var stringifyLines = function stringifyLines(rows) {
  if (!rows) return [];
  return rows.map(function (row) {
    return row.map(stringifyVal);
  });
};

var getRowIndexForLine = function getRowIndexForLine(rowHeights, lineNumber) {
  return rowHeights.reduce(function (meta, height, rowIndex) {
    if (!(meta.remainingLines >= 0)) {
      return meta;
    }
    meta.rowIndex = rowIndex;
    if (meta.remainingLines < height) {
      meta.lineIndex = meta.remainingLines;
    }
    meta.remainingLines = meta.remainingLines - height;
    return meta;
  }, {
    rowIndex: 0,
    lineIndex: 0,
    remainingLines: lineNumber
  });
};

var getLineFromRow = function getLineFromRow(prev, col, colIndex) {
  var colLines = col.match(new RegExp('.{1,' + prev.colWidths[colIndex] + '}', 'g')) || [''];
  colLines = colLines.concat(getArray(prev.rowHeight - colLines.length).map(function (a) {
    return ' ';
  }));
  var linesStr = colLines.filter(function (_, lineIndex) {
    return lineIndex === prev.lineIndex;
  }).map(function (line) {
    return line + padString(' ', prev.colWidths[colIndex] - line.length);
  });
  prev.lines.push(linesStr);
  return prev;
};

var getColWidths = function getColWidths(rows) {
  return getArray(rows[0].length).map(function (i) {
    return rows.reduce(function (prev, curr) {
      return Math.max(prev, curr[i].length);
    }, 0);
  });
};

var renderForWidth = function renderForWidth(rows, maxColWidth, minColWidth) {
  if (maxColWidth == null) {
    maxColWidth = 30;
  }
  if (minColWidth == null) {
    minColWidth = 3;
  }
  if (!rows.length) {
    return '';
  }
  var colWidths = getColWidths(rows).map(function (colWidth) {
    return Math.max(Math.min(colWidth, maxColWidth), minColWidth);
  });
  var rowHeights = rows.map(function (row) {
    return row.reduce(function (prev, curr, colIndex) {
      return Math.max(1, Math.max(prev, Math.ceil(curr.length / colWidths[colIndex])));
    }, 0);
  });
  var totalLines = rowHeights.reduce(function (tot, curr) {
    return tot + curr;
  }, 0);
  var output = getArray(totalLines).reduce(function (out, _, i) {
    var lineMeta = getRowIndexForLine(rowHeights, i);
    var rowLines = rows[lineMeta.rowIndex].reduce(getLineFromRow, {
      lines: [],
      lineIndex: lineMeta.lineIndex,
      rowHeight: rowHeights[lineMeta.rowIndex],
      colWidths: colWidths
    }).lines.join('|');
    out.push('|' + rowLines + '|');
    return out;
  }, []);
  output = insertRowSeparators(output, rowHeights, colWidths);
  return output.join('\n');
};

var insertRowSeparators = function insertRowSeparators(lines, rowHeights, colWidths) {
  return rowHeights.reduce(function (out, rowHeight, rowIndex) {
    out.curr.push.apply(out.curr, out.feeder.splice(0, rowHeight));
    if (rowIndex !== 0) out.curr.push(getThinSeparatorLine(colWidths));
    if (rowIndex === 0) out.curr.push(getThickSeparatorLine(colWidths));
    return out;
  }, {
    feeder: lines,
    curr: [getThickSeparatorLine(colWidths)]
  }).curr;
};

var getThickSeparatorLine = function getThickSeparatorLine(colWidths) {
  return getSeparatorLine('=', '+', colWidths);
};
var getThinSeparatorLine = function getThinSeparatorLine(colWidths) {
  return getSeparatorLine('-', '+', colWidths);
};
var getSeparatorLine = function getSeparatorLine(horChar, vertChar, colWidths) {
  return vertChar + colWidths.map(function (w) {
    return padString(horChar, w);
  }).join(vertChar) + vertChar;
};

var padString = function padString(character, width) {
  if (!(width > 0)) {
    return '';
  }
  return getArray(width).map(function () {
    return character;
  }).join('');
};

exports.default = {
  run: function run(rows) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? { maxColumnWidth: 30 } : arguments[1];
    return renderForWidth(stringifyLines(rows), options.maxColumnWidth);
  }
};

//# sourceMappingURL=ascii-data-table.js.map