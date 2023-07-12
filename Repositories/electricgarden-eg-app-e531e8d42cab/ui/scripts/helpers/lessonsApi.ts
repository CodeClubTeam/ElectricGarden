import fetch from 'node-fetch';

import { getRequiredConfig } from './config';
import { LessonMetadata } from '../../src/lessons/definition';

type Lesson = {
    name: string;
    // etc
};

const getApiSettings = () => {
    const apiBaseUrl = getRequiredConfig('PROVISION_API_BASE_URL');
    const apiKey = getRequiredConfig('PROVISION_API_KEY');
    const apiKeyBase64 = Buffer.from(apiKey).toString('base64');

    const headers = {
        authorization: `Basic ${apiKeyBase64}`,
        'Content-Type': 'application/json',
    };

    return { apiBaseUrl, headers };
};

export const getLessons = async () => {
    const { apiBaseUrl, headers } = getApiSettings();
    const url = `${apiBaseUrl}/lessons`;
    const response = await fetch(url, {
        method: 'GET',
        headers,
    });
    if (!response.ok) {
        throw new Error(
            `Failed to fetch lessons. Response from ${url}: Status: ${
                response.status
            } content: ${await response.text()}`,
        );
    }
    return (await response.json()) as Lesson[];
};

export const upsertLesson = async (
    values: LessonMetadata & { contentPath: string },
) => {
    const { name } = values;
    const { apiBaseUrl, headers } = getApiSettings();
    const url = `${apiBaseUrl}/lessons/${encodeURIComponent(name)}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(values),
    });
    if (!response.ok) {
        if (response.status === 400) {
            const { validationErrors } = await response.json();
            for (const error of validationErrors) {
                console.warn(error);
            }
        }
        throw new Error(
            `Failed to save lesson named: ${name}. Response from ${url}: Status: ${
                response.status
            } content: ${await response.text()}`,
        );
    }
};

export const deleteLesson = async (name: string) => {
    const { apiBaseUrl, headers } = getApiSettings();
    const url = `${apiBaseUrl}/lessons/${encodeURIComponent(name)}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers,
    });
    if (!response.ok) {
        throw new Error(
            `Failed to delete lesson named: ${name}. Response from ${url}: Status: ${
                response.status
            } content: ${await response.text()}`,
        );
    }
};
