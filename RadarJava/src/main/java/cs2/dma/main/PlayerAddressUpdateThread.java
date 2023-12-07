package cs2.dma.main;

import com.alibaba.fastjson.JSONObject;
import cs2.dma.entry.Offsets;
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
        long EntityPawnListEntry=memoryTool.readAddress(clientAddress+ Offsets.dwEntityList,8);
        if(EntityPawnListEntry==0) return;

        long Pawn=memoryTool.readAddress(EntityAddress+Offsets.m_hPlayerPawn,8);//m_hPlayerPawn


        if(Pawn==0) return;
        EntityPawnListEntry=memoryTool.readAddress(EntityPawnListEntry+0x10 +8*((Pawn & 0x7FFF) >> 9),8);
        Pawn=memoryTool.readAddress(EntityPawnListEntry+0x78 * (Pawn & 0x1FF),8);
        if(Pawn==0) return;
        float localPlayerZ =memoryTool.readFloat(LocalPlayerController+Offsets.m_vOldOrigin +0x8,8);
        int localPlayerTeamId =memoryTool.readInt(LocalPlayerController+Offsets.m_iTeamNum,4);
        int teamId=  memoryTool.readInt( EntityAddress+Offsets.m_iTeamNum,4);
        boolean isEnemy=localPlayerTeamId!=teamId;


        if(!GameViewController.showTeam&&!isEnemy&&LocalPlayerController!=Pawn){
            return;
        }

        float angle =memoryTool.readFloat(LocalPlayerController+(Offsets.m_angEyeAngles +0x4),8)-90;

        if(isKnowMap){
                float enemyAngle=90-memoryTool.readFloat(Pawn+(Offsets.m_angEyeAngles +0x4),8);
                if(GameViewController.rotateMap&&LocalPlayerController!=Pawn){
                    enemyAngle+=angle;
                }

                float playerZ=memoryTool.readFloat(Pawn+Offsets.m_vOldOrigin +0x8,8);

                float levelDv=playerZ-localPlayerZ;
                levelDv=  (levelDv < 0) ? -levelDv : levelDv;
               playerInfo=new PlayerInfo(
                       EntityAddress,
                       Pawn,
                        teamId,
                        memoryTool.readInt( Pawn+Offsets.m_iHealth,4),
                        memoryTool.readInt( Pawn+Offsets.m_iPawnArmor,4),
                        memoryTool.readInt( Pawn+Offsets.m_lifeState   ,4)==256,
                        LocalPlayerController==Pawn,
                       isEnemy,
                        memoryTool.readFloat(Pawn+Offsets.m_vOldOrigin +0x4,8),
                        memoryTool.readFloat(Pawn+Offsets.m_vOldOrigin ,8),
                        playerZ ,
                       enemyAngle,
                        levelDv<levelHeight
                );

        }else{

                float pX=memoryTool.readFloat(Pawn+Offsets.m_vOldOrigin +0x4,8);
                float pY=memoryTool.readFloat(Pawn+Offsets.m_vOldOrigin ,8);
                float newX=pX*(float) Math.cos(Math.toRadians(angle))-pY*(float) Math.sin(Math.toRadians(angle));
                float newY=pX*(float) Math.sin(Math.toRadians(angle))+pY*(float) Math.cos(Math.toRadians(angle));

                float playerZ=memoryTool.readFloat(Pawn+Offsets.m_vOldOrigin +0x8,8);
                float levelDv=playerZ-localPlayerZ;
                levelDv=  (levelDv < 0) ? -levelDv : levelDv;

              playerInfo=new PlayerInfo(
                      EntityAddress,
                      Pawn,
                        teamId,
                        memoryTool.readInt( Pawn+Offsets.m_iHealth,4),
                        memoryTool.readInt( Pawn+Offsets.m_iPawnArmor,4),
                        memoryTool.readInt( Pawn+Offsets.m_lifeState  ,4)==256,
                        LocalPlayerController==Pawn,
                      isEnemy,
                        newX,
                        newY,
                        playerZ,
                        90-memoryTool.readFloat(Pawn+(Offsets.m_angEyeAngles +0x4),8)+angle,
                        levelDv<levelHeight
                );
        }

    }

}