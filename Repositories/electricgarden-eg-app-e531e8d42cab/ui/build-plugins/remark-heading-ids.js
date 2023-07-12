// modified from https://github.com/remarkjs/remark-slug/blob/master/index.js to
// populate id props used by it so it won't regenerate ids from the heading

const visit = require('unist-util-visit');

module.exports = headingIds;

function headingIds() {
    return transformer;
}

const HEADING_ID_REGEX = /\{#(.+)\}/;
const HEADING_ID_VALUE_REGEX = /^.*\{#(.+)\}/;

// extract and remove any {#id}. section from headings as id for slugify plugin
function transformer(ast) {
    visit(ast, 'heading', visitor);

    function visitor(node) {
        const textNode = node.children.find((child) => child.type === 'text');
        if (!textNode || !textNode.value) {
            return;
        }
        const heading = textNode.value;
        const idMatch = heading.match(HEADING_ID_VALUE_REGEX);
        if (!idMatch) {
            // nothing to do
            return;
        }

        const data = node.data || (node.data = {});
        const props = data.hProperties || (data.hProperties = {});
        const id = idMatch[1];

        // now the id bit has done it's job, strip it from the markdown so it doesn't show
        // up in heading content
        textNode.value = textNode.value.replace(HEADING_ID_REGEX, '');

        data.id = id;
        props.id = id;
    }
}
