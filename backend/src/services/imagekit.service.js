const config = require("../config/config");
const sharp = require("sharp");


// Upload Photo
async function uploadPhoto(file, folder) {
    try {
        if (!file?.buffer?.length) {
            throw new Error("Uploaded photo is empty");
        }

        // Resize + compress image
        const compressedImage = await sharp(file.buffer)
            .resize({
                width: 500,
                height: 650,
                fit: "inside",
                withoutEnlargement: true
            })
            .jpeg({
                quality: 75
            })
            .toBuffer();

        const form = new FormData();

        form.append(
            "file",
            new Blob(
                [compressedImage],
                { type: "image/jpeg" }
            ),
            "photo.jpg"
        );

        form.append(
            "fileName",
            `photo-${Date.now()}.jpg`
        );

        form.append(
            "folder",
            `/Maktab-Images/${folder}`
        );

        form.append(
            "useUniqueFileName",
            "true"
        );

        const response = await fetch(
            "https://upload.imagekit.io/api/v1/files/upload",
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${Buffer.from(
                        `${config.imageKit.privateKey}:`
                    ).toString("base64")}`
                },
                body: form
            }
        );

        const responseBody = await response.json().catch(
            () => ({})
        );

        if (!response.ok) {
            const providerMessage =
                responseBody.message ||
                responseBody.help ||
                response.statusText;

            throw new Error(
                `ImageKit upload failed (${response.status}): ${providerMessage}`
            );
        }

        return {
            url: responseBody.url,
            fileId: responseBody.fileId
        };

    } catch (error) {
        console.error("ImageKit upload error:", error);

        throw new Error(
            error.message || "Photo upload failed"
        );
    }
}


// Delete Photo
async function deletePhoto(fileId) {
    try {
        if (!fileId) {
            return;
        }

        const response = await fetch(
            `https://api.imagekit.io/v1/files/${fileId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Basic ${Buffer.from(
                        `${config.imageKit.privateKey}:`
                    ).toString("base64")}`
                }
            }
        );

        if (!response.ok) {
            const responseBody = await response.json().catch(
                () => ({})
            );

            throw new Error(
                responseBody.message ||
                `ImageKit delete failed (${response.status})`
            );
        }

    } catch (error) {
        console.error(
            "ImageKit delete error:",
            error.message
        );
    }
}


module.exports = {
    uploadPhoto,
    deletePhoto
};