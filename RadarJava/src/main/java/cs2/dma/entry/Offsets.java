package cs2.dma.entry;

import com.alibaba.fastjson.JSONObject;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class Offsets {
    public  static long dwEntityList;
    public  static long dwLocalPlayerPawn;
    public  static long dwGameTypes_mapName;

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
        dwEntityList=           offsetsJsonObj.getJSONObject("client.dll")      .getLongValue("dwEntityList");
        dwLocalPlayerPawn=      offsetsJsonObj.getJSONObject("client.dll")      .getLongValue("dwLocalPlayerPawn");
        dwGameTypes_mapName=    offsetsJsonObj.getJSONObject("matchmaking.dll") .getLongValue("dwGameTypes_mapName");
        m_iTeamNum=             clientJsonObj.getJSONObject("client.dll")       .getJSONObject("classes").getJSONObject("C_BaseEntity")        .getJSONObject("fields").getLongValue("m_iTeamNum");
        m_hPlayerPawn=          clientJsonObj.getJSONObject("client.dll")       .getJSONObject("classes").getJSONObject("CCSPlayerController") .getJSONObject("fields").getLongValue("m_hPlayerPawn");
        m_angEyeAngles=         clientJsonObj.getJSONObject("client.dll")       .getJSONObject("classes").getJSONObject("C_CSPlayerPawnBase")  .getJSONObject("fields").getLongValue("m_angEyeAngles");
        m_iHealth=              clientJsonObj.getJSONObject("client.dll")       .getJSONObject("classes").getJSONObject("C_BaseEntity")        .getJSONObject("fields").getLongValue("m_iHealth");
        m_iPawnArmor=           clientJsonObj.getJSONObject("client.dll")       .getJSONObject("classes").getJSONObject("CCSPlayerController") .getJSONObject("fields").getLongValue("m_iPawnArmor");
        m_lifeState=            clientJsonObj.getJSONObject("client.dll")       .getJSONObject("classes").getJSONObject("C_BaseEntity")        .getJSONObject("fields").getLongValue("m_lifeState");
        m_vOldOrigin=           clientJsonObj.getJSONObject("client.dll")       .getJSONObject("classes").getJSONObject("C_BasePlayerPawn")    .getJSONObject("fields").getLongValue("m_vOldOrigin");
    }

}
