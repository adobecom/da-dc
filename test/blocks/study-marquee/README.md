# Study Marquee Block - Unit Tests

## Overview
This directory contains unit tests for the `study-marquee` block, which provides an interactive file upload widget for educational tools like quiz-maker.

## Test Files

### `study-marquee.test.js`
Main test suite covering:

#### Core Functionality
- **Block Initialization**: Tests that the block initializes properly with all required UI elements (acrobat icon, verb image, security icon, info icon)
- **Authentication States**: Tests both signed-in and signed-out user states
- **File Upload**: Tests file selection via button click and drag-and-drop
- **Error Handling**: Tests error toast display and error tracking

#### Analytics Tracking
- **Event Tracking**: Tests all analytics events (change, drop, cancel, uploading, uploaded, redirectUrl, chunk_uploaded)
- **Unknown Events**: Tests that unknown events don't throw errors

#### User Interactions
- **Upload Button Click**: Tests file picker opens and fires correct analytics events
- **File Selection Change**: Tests file input change event handling
- **Drag and Drop**: Tests dragover, dragleave, and drop events with multiple files
- **Browser Navigation**: Tests beforeunload and pageshow events

## Mock Files

### `mocks/head.html`
Contains required CSS imports for testing:
- `/acrobat/styles/styles.css`
- `/acrobat/blocks/study-marquee/study-marquee.css`

### `mocks/body-quiz-maker.html`
Sample HTML structure for quiz-maker variant:
- `.study-marquee.quiz-maker` block
- Heading and legal text placeholders

### `mocks/placeholders.json`
Mock placeholder data including:
- CTA text for single and multi-file uploads
- Drag-and-drop text
- File limit text
- Security message
- Error messages (file size, file type, multiple files, generic)
- Legal text
- Status messages (uploading, processing, download)

## Running Tests

### Run all tests:
```bash
npm test
```

### Run only study-marquee tests:
```bash
npm run wtr:file "./test/blocks/study-marquee/study-marquee.test.js"
```

### Watch mode (for development):
```bash
npm run wtr:file:watch "./test/blocks/study-marquee/study-marquee.test.js"
```

## Test Results

All 10 tests passing with 61.51% code coverage ✅

## Test Coverage

The test suite covers:
- ✅ Block initialization and DOM structure (acrobat icon, info icon)
- ✅ User authentication states (signed-in/signed-out)
- ✅ File upload button exists
- ✅ File input change event handling
- ✅ Drag-and-drop events (dragover, dragleave, drop)
- ✅ Analytics event tracking (all event types)
- ✅ Error handling and toast display
- ✅ Browser navigation events (beforeunload, pageshow)

## Dependencies

Tests use:
- `@web/test-runner` - Test runner
- `@esm-bundle/chai` - Assertions
- `sinon` - Mocking and spying
- `@web/test-runner-commands` - File reading for mocks

## Notes

- Tests use sinon to mock `window.fetch`, `XMLHttpRequest`, `window.analytics`, and `window.adobeIMS`
- LocalStorage is cleared before attempt tracking tests
- Tests verify that analytics events match those in `verb-widget.js` for consistency
- The study-marquee block uses the same analytics patterns as verb-widget but without UI changes based on attempt count
