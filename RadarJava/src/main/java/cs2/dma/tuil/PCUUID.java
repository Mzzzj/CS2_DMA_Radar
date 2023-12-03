package cs2.dma.tuil;

import org.ini4j.spi.RegEscapeTool;

import java.io.IOException;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Scanner;

public class PCUUID {
    public static String getUUID() throws IOException {
        return encode(getWindowsCpuId()+getWindowsBiosUUID());
    }
    /**
     * 获取windows系统 bios uuid
     *
     * @return
     * @throws IOException
     */
    private static String getWindowsBiosUUID() throws IOException, IOException {
        Process process = Runtime.getRuntime().exec(
                new String[]{"wmic", "path", "win32_computersystemproduct", "get", "uuid"});
        process.getOutputStream().close();
        Scanner sc = new Scanner(process.getInputStream());
        sc.next();
        String serial = sc.next();
        return serial.toUpperCase().replace(" ", "");
    }
    /**
     * 获取windows系统CPU序列
     */
    private static String getWindowsCpuId() throws IOException {
        Process process = Runtime.getRuntime().exec(
                new String[]{"wmic", "cpu", "get", "ProcessorId"});
        process.getOutputStream().close();
        Scanner sc = new Scanner(process.getInputStream());
        sc.next();
        String serial = sc.next();
        return serial.toUpperCase().replace(" ", "");
    }
    /**
     * java 实现Md5
     */
    /**
     * 直接加密
     *
     * @param data 要加密的数据
     * @return 加密后的结果
     */
    private static String encode(String data) {
        try {
            MessageDigest messageDigest = MessageDigest.getInstance("MD5");
            messageDigest.update(data.getBytes(StandardCharsets.UTF_8));
            byte[] bytes = messageDigest.digest();
            return new BigInteger(1, bytes).toString(16);
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        return "";
    }
}
