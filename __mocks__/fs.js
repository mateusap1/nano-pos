// fs.js

const fs = jest.createMockFromModule('fs');

let mockFiles = {};

/**
 * This is a custom function that our tests can use during setup to specify
 * what the files on the "mock" filesystem should look like when any of the
 * `fs` APIs are used.
 *
 * @param {Object} newMockFiles - The keys are the file paths and the values are
 *      the file contents.
 *
 * @example
 * import * as fs from 'fs';
 * jest.mock('fs');
 * const files = {
 *   '/path/to/file1.js': 'console.log("file1 contents");',
 *   '/path/to/file2.txt': 'file2 contents',
 * };
 * fs.setMockFiles(files);
 */
function setMockFiles(newMockFiles) {
  mockFiles = { ...newMockFiles };
}

/**
 *
 * @returns {Object} The mock files. The keys are the file paths and the values are
 *      the file contents.
 */
function getMockFiles() {
  return mockFiles;
}

fs.setMockFiles = setMockFiles;
fs.getMockFiles = getMockFiles;
fs.readFileSync = jest.fn((filePath) => mockFiles[filePath]);
fs.existsSync = jest.fn((filePath) => filePath in mockFiles);

module.exports = fs;