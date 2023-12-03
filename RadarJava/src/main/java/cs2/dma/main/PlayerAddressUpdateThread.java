package cs2.dma.main;

import com.alibaba.fastjson.JSONObject;
import cs2.dma.entry.PlayerInfo;
import cs2.dma.tuil.MemoryTool;

import java.util.Random;

public class PlayerAddressUpdateThread extends Thread {
    private  int index;
    private PlayerInfo playerInfo;
    private boolean isKnowMap;
    private   float levelHeight =250;
    private MemoryTool memoryTool;
    private long EntityList;
    private long clientAddress;
    
    private long LocalPlayerController;

    private long dwEntityList;

    private long m_iTeamNum =0x3BF;
    private long m_hPlayerPawn =0x7EC;

    private long m_angEyeAngles  =0x1510;
    private long m_iHealth  =0x32C;
    private long m_iPawnArmor   =0x7FC;
    private long m_lifeState    =0x330;
    private long m_vOldOrigin     =0x1224;

    public void setKnowMap(boolean knowMap) {
        isKnowMap = knowMap;
    }

    public void setLocalPlayerController(long localPlayerController) {
        LocalPlayerController = localPlayerController;
    }

    public void setEntityList(long entityList) {
        EntityList = entityList;
    }

    public void setClientAddress(long clientAddress) {
        this.clientAddress = clientAddress;
    }

    public void setDwEntityList(long dwEntityList) {
        this.dwEntityList = dwEntityList;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public void setMemoryTool(MemoryTool memoryTool) {
        this.memoryTool = memoryTool;
    }

    public PlayerInfo getPlayerInfo() {
        return playerInfo;
    }

    @Override
    public void run() {
        long EntityAddress=memoryTool.readAddress(EntityList+(index + 1) * 0x78,8);
        if(EntityAddress==0) return;
        long EntityPawnListEntry=memoryTool.readAddress(clientAddress+dwEntityList,8);
        if(EntityPawnListEntry==0) return;

        long Pawn=memoryTool.readAddress(EntityAddress+m_hPlayerPawn,8);//m_hPlayerPawn


        if(Pawn==0) return;
        EntityPawnListEntry=memoryTool.readAddress(EntityPawnListEntry+0x10 +8*((Pawn & 0x7FFF) >> 9),8);
        Pawn=memoryTool.readAddress(EntityPawnListEntry+0x78 * (Pawn & 0x1FF),8);
        if(Pawn==0) return;
        float localPlayerZ =memoryTool.readFloat(LocalPlayerController+m_vOldOrigin +0x8,8);
        int localPlayerTeamId =memoryTool.readInt(LocalPlayerController+m_iTeamNum,4);
        int teamId=  memoryTool.readInt( EntityAddress+m_iTeamNum,4);
        boolean isEnemy=localPlayerTeamId!=teamId;


        if(!GameViewController.showTeam&&!isEnemy&&LocalPlayerController!=Pawn){
            return;
        }

        float angle =memoryTool.readFloat(LocalPlayerController+(m_angEyeAngles +0x4),8)-90;

        if(isKnowMap){
                float enemyAngle=90-memoryTool.readFloat(Pawn+(m_angEyeAngles +0x4),8);
                if(GameViewController.rotateMap&&LocalPlayerController!=Pawn){
                    enemyAngle+=angle;
                }

                float playerZ=memoryTool.readFloat(Pawn+m_vOldOrigin +0x8,8);

                float levelDv=playerZ-localPlayerZ;
                levelDv=  (levelDv < 0) ? -levelDv : levelDv;
               playerInfo=new PlayerInfo(
                       EntityAddress,
                       Pawn,
                        teamId,
                        memoryTool.readInt( Pawn+m_iHealth,4),
                        memoryTool.readInt( Pawn+m_iPawnArmor,4),
                        memoryTool.readInt( Pawn+m_lifeState   ,4)!=257,
                        LocalPlayerController==Pawn,
                       isEnemy,
                        memoryTool.readFloat(Pawn+m_vOldOrigin +0x4,8),
                        memoryTool.readFloat(Pawn+m_vOldOrigin ,8),
                        playerZ ,
                       enemyAngle,
                        levelDv<levelHeight
                );
        }else{

                float pX=memoryTool.readFloat(Pawn+m_vOldOrigin +0x4,8);
                float pY=memoryTool.readFloat(Pawn+m_vOldOrigin ,8);
                float newX=pX*(float) Math.cos(Math.toRadians(angle))-pY*(float) Math.sin(Math.toRadians(angle));
                float newY=pX*(float) Math.sin(Math.toRadians(angle))+pY*(float) Math.cos(Math.toRadians(angle));

                float playerZ=memoryTool.readFloat(Pawn+m_vOldOrigin +0x8,8);
                float levelDv=playerZ-localPlayerZ;
                levelDv=  (levelDv < 0) ? -levelDv : levelDv;

              playerInfo=new PlayerInfo(
                      EntityAddress,
                      Pawn,
                        teamId,
                        memoryTool.readInt( Pawn+m_iHealth,4),
                        memoryTool.readInt( Pawn+m_iPawnArmor,4),
                        memoryTool.readInt( Pawn+m_lifeState  ,4)!=0,
                        LocalPlayerController==Pawn,
                      isEnemy,
                        newX,
                        newY,
                        playerZ,
                        90-memoryTool.readFloat(Pawn+(m_angEyeAngles +0x4),8)+angle,
                        levelDv<levelHeight
                );
        }

    }

}