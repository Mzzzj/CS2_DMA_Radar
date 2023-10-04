package cs2.dma.tuil;

import cs2.dma.entry.PlayerInfo;
import cs2.dma.main.PlayerAddressUpdateThread;
import vmm.IVmm;
import vmm.IVmmMemScatterMemory;
import vmm.IVmmProcess;

import java.util.*;

public class GameDataManager {


    private static long dwLocalPlayerPawn  =0x187AC38;
    private static long dwEntityList   =0x178D8D8;

    private   String knowMap= "de_ancient,de_dust2,de_inferno,de_mirage,de_nuke,de_overpass,de_vertigo";
    private static String[] argvMemProcFS = {"","-device", "FPGA"};

    private static IVmmProcess gameProcess;
    private static MemoryTool memoryTool;

    private  static long clientAddress;
    private  long EntityList;
    private  long LocalPlayerController;
    private  long mapNameAddress;
    private  static  List<PlayerInfo> playerInfoList;

    private String mapName;


    private  IVmm vmm;
    public boolean initializeVmm(){
        this.vmm = IVmm.initializeVmm(System.getProperty("user.dir")+"\\vmm", argvMemProcFS);
        vmm.setConfig(IVmm.VMMDLL_OPT_REFRESH_FREQ_FAST, 1);
        return vmm.isValid();
    }

    public IVmm getVmm() {
        return vmm;
    }


    public  String getMapName(){
        return mapName;
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
       mapNameAddress=memoryTool.getModuleAddress("matchmaking.dll");
       mapNameAddress=memoryTool.readAddress(mapNameAddress+0x001CC350,8);
       EntityList=memoryTool.readAddress(clientAddress+dwEntityList,8);
       EntityList=memoryTool.readAddress(EntityList+0x10,8);

       initPlayerInfo();
       if(EntityList==0){
           return false;
       }

        return true;
    }

    public  void  initPlayerInfo(){

        mapName= memoryTool.readString(mapNameAddress+0x4,32);
        LocalPlayerController=memoryTool.readAddress(clientAddress+dwLocalPlayerPawn,8);
        if(LocalPlayerController==0){
            return;
        }
        List<PlayerInfo> list=new ArrayList<>();
        List<PlayerAddressUpdateThread> pautList=new ArrayList<>();
        boolean isKnowMap=mapName!=null&&!"".equals(mapName)&&knowMap.indexOf(mapName)!=-1;
        for (int i = 0; i < 64; i++) {
            PlayerAddressUpdateThread updateThread=new PlayerAddressUpdateThread();
            updateThread.setIndex(i);
            updateThread.setMemoryTool(memoryTool);
            updateThread.setClientAddress(clientAddress);
            updateThread.setEntityList(EntityList);
            updateThread.setDwEntityList(dwEntityList);
            updateThread.setLocalPlayerController(LocalPlayerController);
            updateThread.setKnowMap(isKnowMap);
            updateThread.start();
            pautList.add(updateThread);
        }
        pautList.forEach(pItem->{
            try {
                pItem.join();
                PlayerInfo data=pItem.getPlayerInfo();
                if(data!=null){
                    list.add(pItem.getPlayerInfo());
                }
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        });
        playerInfoList=list;
    }
    public  List<PlayerInfo> getPlayerInfoList() {
        return playerInfoList;
    }


}
