/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Returns true if argument is an 'array' and false otherwise.
 * @param {unknown} v - the value to check
 */
export const isArray = <T extends any[]>(v: unknown): v is T => {
  return Array.isArray(v);
};

/**
 * Returns true if argument is an 'object' and false otherwise.
 * Since the result of 'typeof []' is 'object', checks value with isArray() funciton.
 * And the result of 'typeof null' is 'object' too, validate v is not null.
 * @param {unknown} v - the value to check
 */
export const isObject = (v: unknown): v is object => {
  return v !== null && !isArray(v) && typeof v === 'object';
};

/**
 * Returns true if argument is a 'string' and false otherwise.
 * @param {unknown} v - the value to check
 */
export const isString = (v: unknown): v is string => {
  return typeof v === 'string';
};

/**
 * Returns true if argument is a 'number' and false otherwise.
 * @param {unknown} v - the value to check
 */
export const isNumber = (v: unknown): v is number => {
  return typeof v === 'number';
};

/**
 * Returns true if argument is a 'boolean' and false otherwise.
 * @param {unknown} v - the value to check
 */
export const isBoolean = (v: unknown): v is boolean => {
  return typeof v === 'boolean';
};

/**
 * Returns true if argument is a 'null' and false otherwise.
 * @param {unknown} v - the value to check
 */
export const isNull = (v: unknown): v is null => {
  return v === null;
};


/**
 * Returns true if the argument is a valid GitHub URL and false otherwise.
 * @param {string} url - the URL to check
 */
export const isValidRepoUrl = (url: string): boolean => {
	try {
		const parsedUrl = new URL(url);

		// Check if the hostname is github.com
		if (parsedUrl.hostname !== 'github.com') {
			return false;
		}

		// Split the pathname into parts
		const pathParts = parsedUrl.pathname
			.split('/')
			.filter((part) => part !== '');

		// A valid GitHub URL should have at least two parts (owner and repo)
		if (pathParts.length < 2) {
			return false;
		}

		// Check if the owner and repo parts are non-empty
		const [owner, repo] = pathParts;
		if (!owner || !repo) {
			return false;
		}

		return true;
	} catch (error) {
		// If URL parsing fails, it's not a valid URL
		return false;
	}
};
