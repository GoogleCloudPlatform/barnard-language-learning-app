import { NotSupportedError } from "./errors";

export async function share(shareData: {
	url?: string;
	text?: string;
	title?: string;
	files?: Blob[];
}): Promise<void> {
	const nav: any = navigator;

	if (!("share" in nav)) {
		throw new NotSupportedError("Sharing not supported");
	} else if (
		shareData.files &&
		"canShare" in nav &&
		!nav.canShare({ files: shareData.files })
	) {
		throw new NotSupportedError("Sharing files not supported");
	} else {
		await nav.share(shareData);
	}
}
