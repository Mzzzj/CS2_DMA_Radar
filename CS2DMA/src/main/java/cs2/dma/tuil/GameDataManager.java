package cs2.dma.tuil;

import cs2.dma.entry.PlayerInfo;
import vmm.IVmm;
import vmm.IVmmMemScatterMemory;
import vmm.IVmmProcess;

import java.util.*;

public class GameDataManager {


    private static long dwLocalPlayerPawn  =0x1878C08;
    private static long dwEntityList   =0x178B898;

    private static String[] argvMemProcFS = {"","-device", "FPGA"};

    private static IVmmProcess gameProcess;
    private static MemoryTool memoryTool;

    private  static long clientAddress;
    private  long EntityList;
    private  long LocalPlayerController;
    private  static  List<PlayerInfo> playerInfoList;

    private   float levelHeight =250;
    private  static  String [] knowMap={
            "de_ancient",
            "de_dust2",
            "de_inferno",
            "de_mirage",
            "de_nuke",
            "de_overpass",
            "de_vertigo"
    };

    private  IVmm vmm;
    public boolean initializeVmm(){
        this.vmm = IVmm.initializeVmm(System.getProperty("user.dir")+"\\vmm", argvMemProcFS);
        vmm.setConfig(IVmm.VMMDLL_OPT_REFRESH_FREQ_FAST, 0);
        return vmm.isValid();
    }

    public IVmm getVmm() {
        return vmm;
    }


    public  String getMapName(){
        long matchmakingAddress=memoryTool.getModuleAddress("matchmaking.dll");

        return memoryTool.readString(memoryTool.readAddress(matchmakingAddress+0x001CC350,8)+0x4,32);
    }
    public boolean initializeGameData(){
       List<IVmmProcess> pList= this.vmm.processGetAll();
       for (int i = 0; i < pList.size(); i++) {
           if(pList.get(i).getName().equals("cs2.exe")){
               gameProcess=pList.get(i);
               break;
           }
       }
       memoryTool=new MemoryTool(gameProcess);
       clientAddress=memoryTool.getModuleAddress("client.dll");

       EntityList=memoryTool.readAddress(clientAddress+dwEntityList,8);
       EntityList=memoryTool.readAddress(EntityList+0x10,8);
       initPlayerInfo();
       if(EntityList==0){
           return false;
       }

        return true;
    }

    public  void  initPlayerInfo(){
        LocalPlayerController=memoryTool.readAddress(clientAddress+dwLocalPlayerPawn,8);
        if(LocalPlayerController==0){
            return;
        }
        List<PlayerInfo> list=new ArrayList<>();
        for (int i = 0; i < 32; i++) {
            long EntityAddress=memoryTool.readAddress(EntityList+(i + 1) * 0x78,8);
            if(EntityAddress==0) continue;
            long EntityPawnListEntry=memoryTool.readAddress(clientAddress+dwEntityList,8);
            if(EntityPawnListEntry==0) continue;
            long Pawn=memoryTool.readAddress(EntityAddress+0x7FC,8);
            if(Pawn==0) continue;
            EntityPawnListEntry=memoryTool.readAddress(EntityPawnListEntry+0x10 +8*((Pawn & 0x7FFF) >> 9),8);
            Pawn=memoryTool.readAddress(EntityPawnListEntry+0x78 * (Pawn & 0x1FF),8);
            if(Pawn==0) continue;
            PlayerInfo playerInfo=new PlayerInfo();
            playerInfo.setEntityAddress(EntityAddress);
            playerInfo.setEntityPawnAddress(Pawn);
            list.add(playerInfo);
        }
//        for (int i = 0; i < 32; i++) {
//            long EntityAddress=memoryTool.readAddress(EntityList+(i + 1) * 0x78,8);
//            if(EntityAddress==0) continue;
//            long Pawn=memoryTool.readAddress(EntityAddress+0x7FC,8);
//            Pawn=memoryTool.readAddress(EntityList+0x78 * (Pawn & 0x1FF),8);
//            if(Pawn==0) continue;
//            PlayerInfo playerInfo=new PlayerInfo();
//            playerInfo.setEntityAddress(EntityAddress);
//            playerInfo.setEntityPawnAddress(Pawn);
//            list.add(playerInfo);
//        }
        playerInfoList=list;
    }
    public  List<PlayerInfo> getPlayerInfoList() {
        List<PlayerInfo> list=new ArrayList<>();
        float localPlayerZ =memoryTool.readFloat(LocalPlayerController+0xCD8+0x8,8);
        if(isKnowMap()){
            playerInfoList.forEach(item->{
                int teamId=  memoryTool.readInt( item.getEntityAddress()+0x3bf,4);
                float playerZ=memoryTool.readFloat(item.getEntityPawnAddress()+0xCD8+0x8,8);
                float levelDv=playerZ-localPlayerZ;
                levelDv=  (levelDv < 0) ? -levelDv : levelDv;
                PlayerInfo playerInfo=new PlayerInfo(
                        item.getEntityAddress(),
                        item.getEntityPawnAddress(),
                        teamId,
                        memoryTool.readInt( item.getEntityAddress()+0x808,4),
                        memoryTool.readInt( item.getEntityAddress()+0x80C,4),
                        memoryTool.readInt( item.getEntityAddress()+0x804,4)!=0,
                        LocalPlayerController==item.getEntityPawnAddress(),
                        memoryTool.readInt( LocalPlayerController+0x3bf,4)!=teamId,
                        memoryTool.readFloat(item.getEntityPawnAddress()+0xCD8+0x4,8),
                        memoryTool.readFloat(item.getEntityPawnAddress()+0xCD8,8),
                        playerZ ,
                        90-memoryTool.readFloat(item.getEntityPawnAddress()+0x1504,8),
                        levelDv<levelHeight
                );
                list.add(playerInfo);
            });
        }else{
            float angle =memoryTool.readFloat(LocalPlayerController+0x1504,8)-90;
            playerInfoList.forEach(item->{
                int teamId=  memoryTool.readInt( item.getEntityAddress()+0x3bf,4);
                float pX=memoryTool.readFloat(item.getEntityPawnAddress()+0xCD8+0x4,8);
                float pY=memoryTool.readFloat(item.getEntityPawnAddress()+0xCD8,8);
                float newX=pX*(float) Math.cos(Math.toRadians(angle))-pY*(float) Math.sin(Math.toRadians(angle));
                float newY=pX*(float) Math.sin(Math.toRadians(angle))+pY*(float) Math.cos(Math.toRadians(angle));

                float playerZ=memoryTool.readFloat(item.getEntityPawnAddress()+0xCD8+0x8,8);
                float levelDv=playerZ-localPlayerZ;
                levelDv=  (levelDv < 0) ? -levelDv : levelDv;

                PlayerInfo playerInfo=new PlayerInfo(
                        item.getEntityAddress(),
                        item.getEntityPawnAddress(),
                        teamId,
                        memoryTool.readInt( item.getEntityAddress()+0x808,4),
                        memoryTool.readInt( item.getEntityAddress()+0x80C,4),
                        memoryTool.readInt( item.getEntityAddress()+0x804,4)!=0,
                        LocalPlayerController==item.getEntityPawnAddress(),
                        memoryTool.readInt( LocalPlayerController+0x3bf,4)!=teamId,
                        newX,
                        newY,
                        playerZ,
                        90-memoryTool.readFloat(item.getEntityPawnAddress()+0x1504,8)+angle,
                        levelDv<levelHeight
                );
                list.add(playerInfo);
            });
        }

        return list;
    }

    public  boolean isKnowMap(){
        String mapName=getMapName();
        for (int i = 0; i < knowMap.length; i++) {
            if(mapName.equals(knowMap[i])){
                return true;
            }
        }
        return false;
    }

    public static float Conv_k(float p)
    {
        while (p > 180)
        {
            p = p - 360;
        }
        while (p < -180)
        {
            p = p + 360;
        }

        if(p<=90)
        {
            return 90 - p;
        }
        if(p>90)
        {
            return 360 + (90 - p);
        }
        return 0;
    }
}
