export interface LessonSection {
    name: string;
    title: string;
}

// this is the raw metadata from the content yaml headers
// and submitted to the lesson provisioning api
// it includes the app env and interpreted booleans on publish and locked settings
export interface LessonMetadataRaw
    extends Omit<LessonMetadata, 'locked' | 'publish'> {
    locked?: boolean | string;
}

// this is the one used in the main app when retrieved
// the publish and locked flags are translated to booleans per the APP_ENV on the server
export interface LessonMetadata {
    name: string;
    title: string;
    sections: LessonSection[];
    level?: number;
    categories?: string[];
    publish?: boolean;
    seasons?: string[];
    badges?: {
        prerequisites?: string[];
        earned?: string[];
    };
    coverImagePath?: string;
    locked?: boolean;
    kiosk?: boolean;
    term?: number;
    type?: 'giants-guide' | 'facilitation-guide' | 'lesson';
    ordinal?: number;
}
