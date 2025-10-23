import ENDPOINTS from 'services/api/endpoints';
import NetworkService from 'services/NetworkService';

import { IReleaseNote } from './types';

const api = new NetworkService(`${ENDPOINTS.RELEASE_NOTES.BASE}`);

/**
 * function fetchReleaseNotes
 * this call is used for fetching release notes list.
 * @returns {Promise<IReleaseNote[]>}
 */
async function fetchReleaseNotes(): Promise<IReleaseNote[]> {
  try {
    return (
      await api.makeAPIGetRequest(ENDPOINTS.RELEASE_NOTES.GET, {
        query_params: { per_page: 10 },
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'AIM-UI/3.29.1',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
    ).body;
  } catch (error) {
    console.warn('Failed to fetch release notes from GitHub API:', error);
    // Return empty array as fallback
    return [];
  }
}

/**
 * function fetchLatestRelease
 * this call is used for fetching latest release note.
 * @returns {Promise<IReleaseNote>}
 */
async function fetchLatestRelease(): Promise<IReleaseNote> {
  try {
    return (
      await api.makeAPIGetRequest(`${ENDPOINTS.RELEASE_NOTES.GET}/latest`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'AIM-UI/3.29.1',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
    ).body;
  } catch (error) {
    console.warn('Failed to fetch latest release from GitHub API:', error);
    throw error;
  }
}

/**
 * function fetchLatestReleaseById
 * this call is used for fetching release note by id.
 * @returns {Promise<IReleaseNote>}
 */
async function fetchReleaseById(id: string): Promise<IReleaseNote> {
  try {
    return (
      await api.makeAPIGetRequest(`${ENDPOINTS.RELEASE_NOTES.GET}/${id}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'AIM-UI/3.29.1',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
    ).body;
  } catch (error) {
    console.warn('Failed to fetch release by ID from GitHub API:', error);
    throw error;
  }
}

/**
 * function fetchLatestReleaseByTagName
 * this call is used for fetching release note by tag name.
 * @returns {Promise<IReleaseNote>}
 */

async function fetchReleaseByTagName(tagName: string): Promise<IReleaseNote> {
  try {
    return (
      await api.makeAPIGetRequest(
        `${ENDPOINTS.RELEASE_NOTES.GET}${ENDPOINTS.RELEASE_NOTES.GET_BY_TAG_NAME}/${tagName}`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'AIM-UI/3.29.1',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      )
    ).body;
  } catch (error) {
    console.warn('Failed to fetch release by tag name from GitHub API:', error);
    throw error;
  }
}

export {
  fetchReleaseNotes,
  fetchLatestRelease,
  fetchReleaseById,
  fetchReleaseByTagName,
};
