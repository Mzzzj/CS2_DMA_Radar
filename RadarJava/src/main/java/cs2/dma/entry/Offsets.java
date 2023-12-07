package cs2.dma.entry;

import com.alibaba.fastjson.JSONObject;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class Offsets {
    public  static long dwEntityList;
    public  static long dwLocalPlayerPawn;
    public  static long mapNameVal=0x1CC200;

    public  static long m_iTeamNum;
    public  static long m_hPlayerPawn;
    public  static long m_angEyeAngles;
    public  static long m_iHealth;
    public  static long m_iPawnArmor;
    public  static long m_lifeState;
    public  static long m_vOldOrigin;

    public static void  LoadOffsets() throws IOException {
        String offsets = new String(Files.readAllBytes(Paths.get("offsets.json")));
        String client = new String(Files.readAllBytes(Paths.get("client.dll.json")));
        JSONObject offsetsJsonObj=JSONObject.parseObject(offsets);
        JSONObject clientJsonObj=JSONObject.parseObject(client);
        dwEntityList=offsetsJsonObj.getJSONObject("client_dll").getJSONObject("data").getJSONObject("dwEntityList").getLong("value");
        dwLocalPlayerPawn=offsetsJsonObj.getJSONObject("client_dll").getJSONObject("data").getJSONObject("dwLocalPlayerPawn").getLong("value");
        m_iTeamNum=clientJsonObj.getJSONObject("C_BaseEntity").getJSONObject("data").getJSONObject("m_iTeamNum").getLong("value");
        m_hPlayerPawn=clientJsonObj.getJSONObject("CCSPlayerController").getJSONObject("data").getJSONObject("m_hPlayerPawn").getLong("value");
        m_angEyeAngles=clientJsonObj.getJSONObject("C_CSPlayerPawnBase").getJSONObject("data").getJSONObject("m_angEyeAngles").getLong("value");
        m_iHealth=clientJsonObj.getJSONObject("C_BaseEntity").getJSONObject("data").getJSONObject("m_iHealth").getLong("value");
        m_iPawnArmor=clientJsonObj.getJSONObject("CCSPlayerController").getJSONObject("data").getJSONObject("m_iPawnArmor").getLong("value");
        m_lifeState=clientJsonObj.getJSONObject("C_BaseEntity").getJSONObject("data").getJSONObject("m_lifeState").getLong("value");
        m_vOldOrigin=clientJsonObj.getJSONObject("C_BasePlayerPawn").getJSONObject("data").getJSONObject("m_vOldOrigin").getLong("value");

    }

}
