import { generateNameFromHeadingCreate } from '../sectionNames';

describe('sectionNames', () => {
    describe('generateNameFromHeading', () => {
        describe(`given "The Ferry Is Ready to Embark"`, () => {
            it('should generate slug "the-ferry-is-ready-to-embark"', () => {
                const generateNameFromHeading = generateNameFromHeadingCreate();
                expect(
                    generateNameFromHeading('The Ferry Is Ready to Embark'),
                ).toBe('the-ferry-is-ready-to-embark');
            });
        });

        describe('given heading exists before', () => {
            const HEADING = 'My Heading is Duplicated';
            let generateNameFromHeading: ReturnType<typeof generateNameFromHeadingCreate>;
            let basicSlug: string;

            beforeEach(() => {
                generateNameFromHeading = generateNameFromHeadingCreate();
                basicSlug = generateNameFromHeading(HEADING);
            });

            it('should generate same slug with -1 suffix', () => {
                expect(generateNameFromHeading(HEADING)).toBe(`${basicSlug}-1`);
            });

            describe('twice before', () => {
                beforeEach(() => {
                    generateNameFromHeading(HEADING);
                });
                it('should generate same slug with -2 suffix', () => {
                    expect(generateNameFromHeading(HEADING)).toBe(
                        `${basicSlug}-2`,
                    );
                });
            });
        });

        describe('given id defined', () => {
            it('should return existing id', () => {
                const generateNameFromHeading = generateNameFromHeadingCreate();
                expect(
                    generateNameFromHeading(
                        'The Ferry Is Ready to Embark {#original-slug}',
                    ),
                ).toBe('original-slug');
            });
        });

        describe('given duplicate heading where previous ocurrence slug defined', () => {
            const HEADING = 'My Heading is Duplicated';
            let generateNameFromHeading: ReturnType<typeof generateNameFromHeadingCreate>;
            let basicSlug: string;

            beforeEach(() => {
                generateNameFromHeading = generateNameFromHeadingCreate();
                basicSlug = generateNameFromHeading(
                    `${HEADING} {#my-heading-is-duplicated}`,
                ); // first occurrence
            });

            it('should return slug with -1 suffix', () => {
                expect(generateNameFromHeading(HEADING)).toBe(`${basicSlug}-1`);
            });

            describe('third occurrence', () => {
                beforeEach(() => {
                    generateNameFromHeading(
                        `${HEADING} {#my-heading-is-duplicated-1}`,
                    );
                });

                it('should return slug with -2 suffix', () => {
                    expect(generateNameFromHeading(HEADING)).toBe(
                        `${basicSlug}-2`,
                    );
                });
            });
        });
    });
});
