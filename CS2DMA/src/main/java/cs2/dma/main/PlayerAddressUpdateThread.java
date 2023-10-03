package cs2.dma.main;

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
        long Pawn=memoryTool.readAddress(EntityAddress+0x7FC,8);
        if(Pawn==0) return;
        EntityPawnListEntry=memoryTool.readAddress(EntityPawnListEntry+0x10 +8*((Pawn & 0x7FFF) >> 9),8);
        Pawn=memoryTool.readAddress(EntityPawnListEntry+0x78 * (Pawn & 0x1FF),8);
        if(Pawn==0) return;
        float localPlayerZ =memoryTool.readFloat(LocalPlayerController+0xCD8+0x8,8);
        if(isKnowMap){
                int teamId=  memoryTool.readInt( EntityAddress+0x3bf,4);
                float playerZ=memoryTool.readFloat(Pawn+0xCD8+0x8,8);
                float levelDv=playerZ-localPlayerZ;
                levelDv=  (levelDv < 0) ? -levelDv : levelDv;
               playerInfo=new PlayerInfo(
                       EntityAddress,
                       Pawn,
                        teamId,
                        memoryTool.readInt( EntityAddress+0x808,4),
                        memoryTool.readInt( EntityAddress+0x80C,4),
                        memoryTool.readInt( EntityAddress+0x804,4)!=0,
                        LocalPlayerController==Pawn,
                        memoryTool.readInt( LocalPlayerController+0x3bf,4)!=teamId,
                        memoryTool.readFloat(Pawn+0xCD8+0x4,8),
                        memoryTool.readFloat(Pawn+0xCD8,8),
                        playerZ ,
                        90-memoryTool.readFloat(Pawn+0x1504,8),
                        levelDv<levelHeight
                );
        }else{
            float angle =memoryTool.readFloat(LocalPlayerController+0x1504,8)-90;
                int teamId=  memoryTool.readInt( EntityAddress+0x3bf,4);
                float pX=memoryTool.readFloat(Pawn+0xCD8+0x4,8);
                float pY=memoryTool.readFloat(Pawn+0xCD8,8);
                float newX=pX*(float) Math.cos(Math.toRadians(angle))-pY*(float) Math.sin(Math.toRadians(angle));
                float newY=pX*(float) Math.sin(Math.toRadians(angle))+pY*(float) Math.cos(Math.toRadians(angle));

                float playerZ=memoryTool.readFloat(Pawn+0xCD8+0x8,8);
                float levelDv=playerZ-localPlayerZ;
                levelDv=  (levelDv < 0) ? -levelDv : levelDv;

              playerInfo=new PlayerInfo(
                      EntityAddress,
                      Pawn,
                        teamId,
                        memoryTool.readInt( EntityAddress+0x808,4),
                        memoryTool.readInt( EntityAddress+0x80C,4),
                        memoryTool.readInt( EntityAddress+0x804,4)!=0,
                        LocalPlayerController==Pawn,
                        memoryTool.readInt( LocalPlayerController+0x3bf,4)!=teamId,
                        newX,
                        newY,
                        playerZ,
                        90-memoryTool.readFloat(Pawn+0x1504,8)+angle,
                        levelDv<levelHeight
                );
        }
    }

}