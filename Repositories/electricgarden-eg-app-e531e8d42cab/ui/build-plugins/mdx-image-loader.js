// webpack loader to take the output from @mdx-js/loader
// and make the img src tags into requires so file-loader will hash and pull them through as assets
//
// markdown-image-loader (used before) doesn't work for the mdx way

module.exports = async function(src) {
    this.cacheable();

    const callback = this.async();

    const imgRe = /(<img[^>]*"src":)\s*(".*?")/gm;
    const imgMixedCaseRe = /<img[^>]*"src":\s*"(.*[A-Z].*)"/gm;

    const content = src.replace(imgRe, '$1 require($2)');

    // very rough but does the job
    const mixedCaseMatches = src.match(imgMixedCaseRe);
    if (mixedCaseMatches) {
        return callback(
            new Error(
                `Referenced images must have lowercase paths: ${mixedCaseMatches.join(
                    ',',
                )}.`,
            ),
        );
    }
    return callback(null, content);
};
