import { MatDialogRef } from "@angular/material/dialog";

export function addOpenedListener(
	dialog: MatDialogRef<any>,
	listener: () => void
) {
	let opened = false;
	dialog.afterOpened().subscribe({
		complete: () => {
			if (!opened) {
				opened = true;
				listener();
			}
		},
	});
	// HACK: afterOpened not firing on some platforms (iPhone 7+ Safari)
	// Force navigation
	setTimeout(() => {
		if (!opened) {
			opened = true;
			listener();
		}
	}, 1000);
}
