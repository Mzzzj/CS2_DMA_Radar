package cs2.dma.main;

import cs2.dma.tuil.GameDataManager;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) throws InterruptedException {
        GameDataManager manager=new GameDataManager();
        if(manager.initializeVmm()){
            //初始化完成
            if(  manager.initializeGameData()){
                GmaeDataController.setGameDataManager(manager);
               SpringApplication.run(DemoApplication.class, args);

            }
        }
    }

}
