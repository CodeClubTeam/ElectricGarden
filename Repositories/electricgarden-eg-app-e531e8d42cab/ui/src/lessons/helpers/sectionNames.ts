import slugify from 'slugify';

export const generateNameFromHeadingCreate = () => {
    const occurrences: Record<string, number> = {};

    const registerOccurrence = (slug: string) => {
        occurrences[slug] = (occurrences[slug] || 0) + 1;
    };

    const generateSlug = (heading: string) => {
        const slug = slugify(heading, { lower: true });
        let candidateSlug = slug;
        while (occurrences[candidateSlug]) {
            candidateSlug = `${slug}-${occurrences[candidateSlug]}`;
            occurrences[candidateSlug] += 1;
        }
        registerOccurrence(candidateSlug);
        return candidateSlug;
    };

    return (heading: string): string => {
        const existingSlug = getExistingSlugFromHeading(heading);
        if (existingSlug) {
            registerOccurrence(existingSlug);
            return existingSlug;
        }

        return generateSlug(heading);
    };
};

const HEADING_SLUG_REGEX = /^.*\{#(.+)\}/;

export const getExistingSlugFromHeading = (
    heading: string,
): string | undefined => {
    const existingSlugMatch = heading.match(HEADING_SLUG_REGEX);
    if (existingSlugMatch) {
        return existingSlugMatch[1];
    }
    return undefined;
};
