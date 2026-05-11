package com.community.board.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String newFilename = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(newFilename);
        file.transferTo(filePath.toFile());

        return "/api/files/" + newFilename;
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl != null && fileUrl.startsWith("/api/files/")) {
            String filename = fileUrl.substring("/api/files/".length());
            Path filePath = Paths.get(uploadDir).resolve(filename);
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // Log error but don't throw
            }
        }
    }
}
