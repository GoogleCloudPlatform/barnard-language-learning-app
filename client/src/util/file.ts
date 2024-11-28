export function downloadFile(fileContent: Blob, fileName: string) {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(fileContent);
	a.download = fileName;
	a.click();
	// delay revoking URL to avoid error on iOS
	setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
