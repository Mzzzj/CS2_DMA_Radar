package cs2.dma.main;

import org.ini4j.Ini;

import java.io.File;
import java.io.IOException;

public class ConfigFileTool {
    private static Ini ini = new Ini();
    public static String getKey(String key) throws IOException {
        File file =new File(System.getProperty("user.dir")+"/config.ini");
        if(!file.exists()){
           return "";
        }
        ini.load(file);
        return  ini.get("config", key);
    }

    public static void saveKey(String putKey) throws IOException {
        File file =new File(System.getProperty("user.dir")+"/config.ini");
        file.delete();
        File newFile =new File(System.getProperty("user.dir")+"/config.ini");

        if(!newFile.exists()){
            newFile.createNewFile();
            ini.load(newFile);
            ini.put("config", "key", putKey);
            ini.store(newFile);
        }
    }
}
