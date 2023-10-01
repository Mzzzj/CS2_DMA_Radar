package cs2.dma.tuil;

import cs2.dma.entry.PlayerInfo;
import vmm.IVmm;
import vmm.IVmmMemScatterMemory;
import vmm.IVmmProcess;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class GameDataManager {

    private static String[] argvMemProcFS = {"","-device", "FPGA"};

    private static IVmmProcess gameProcess;
    private static MemoryTool memoryTool;

    private  static long clientAddress;
    private  long EntityList;
    private  long LocalPlayerController;
    private  static  List<PlayerInfo> playerInfoList;




    private  IVmm vmm;
    public boolean initializeVmm(){
        this.vmm = IVmm.initializeVmm(System.getProperty("user.dir")+"\\vmm", argvMemProcFS);
        vmm.setConfig(IVmm.VMMDLL_OPT_REFRESH_FREQ_FAST, 0);
        return vmm.isValid();
    }

    public IVmm getVmm() {
        return vmm;
    }


    public boolean initializeGameData(){
       List<IVmmProcess> pList= this.vmm.processGetAll();
       for (int i = 0; i < pList.size(); i++) {
           if(pList.get(i).getName().equals("cs2.exe")){
               System.out.println(pList.get(i).getPID()+"----"+pList.get(i).getName());
               gameProcess=pList.get(i);
               break;
           }
       }
       memoryTool=new MemoryTool(gameProcess);
       clientAddress=memoryTool.getModuleAddress("client.dll");

       EntityList=memoryTool.readAddress(clientAddress+0x178C8A8,8);
       EntityList=memoryTool.readAddress(EntityList+0x10,8);
       initPlayerInfo();
       if(EntityList==0){
           return false;
       }

        return true;
    }

    public  void  initPlayerInfo(){
        LocalPlayerController=memoryTool.readAddress(clientAddress+0x1879C18,8);
        if(LocalPlayerController==0){
            return;
        }
        List<PlayerInfo> list=new ArrayList<>();
        for (int i = 0; i < 64; i++) {
            long EntityAddress=memoryTool.readAddress(EntityList+(i + 1) * 0x78,8);
            if(EntityAddress==0) continue;
            long Pawn=memoryTool.readAddress(EntityAddress+0x7FC,8);
            Pawn=memoryTool.readAddress(EntityList+0x78 * (Pawn & 0x1FF),8);
            if(Pawn==0) continue;
            PlayerInfo playerInfo=new PlayerInfo();
            playerInfo.setEntityAddress(EntityAddress);
            playerInfo.setEntityPawnAddress(Pawn);
            list.add(playerInfo);
        }
        playerInfoList=list;
    }
    public  List<PlayerInfo> getPlayerInfoList() {
        List<PlayerInfo> list=new ArrayList<>();
        playerInfoList.forEach(item->{
            int teamId=  memoryTool.readInt( item.getEntityAddress()+0x3bf,4);
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
                    memoryTool.readFloat(item.getEntityPawnAddress()+0xCD8+0x8,8),
                    memoryTool.readFloat(item.getEntityPawnAddress()+0x1504,8)
            );
            list.add(playerInfo);
        });
        return list;
    }


}
