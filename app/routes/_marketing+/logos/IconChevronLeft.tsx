import React from 'react'
import type { SVGProps } from 'react'

export function IconChevronLeft(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 15 15"
			{...props}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M8.842 3.135a.5.5 0 0 1 .023.707L5.435 7.5l3.43 3.658a.5.5 0 0 1-.73.684l-3.75-4a.5.5 0 0 1 0-.684l3.75-4a.5.5 0 0 1 .707-.023"
				clipRule="evenodd"
			></path>
		</svg>
	)
}
