package cs2.dma.entry;

public class PlayerInfo {
    private long entityAddress;
    private long entityPawnAddress;

    private int teamId;
    private int health;
    private int armor;
    private boolean isAlive;
    private boolean isLocalPlayer;
    private boolean isEnemy;
    private  float x;
    private  float y;
    private  float z;
    private  float Angles;
    private  boolean isSameLevel;

    public PlayerInfo() {
    }

    public PlayerInfo(long entityAddress, long entityPawnAddress, int teamId, int health, int armor, boolean isAlive, boolean isLocalPlayer, boolean isEnemy, float x, float y, float z, float angles,boolean isSameLevel) {
        this.entityAddress = entityAddress;
        this.entityPawnAddress = entityPawnAddress;
        this.teamId = teamId;
        this.health = health;
        this.armor = armor;
        this.isAlive = isAlive;
        this.isLocalPlayer = isLocalPlayer;
        this.isEnemy = isEnemy;
        this.x = x;
        this.y = y;
        this.z = z;
        this.Angles = angles;
        this.isSameLevel=isSameLevel;
    }

    public boolean isSameLevel() {
        return isSameLevel;
    }

    public void setSameLevel(boolean sameLevel) {
        isSameLevel = sameLevel;
    }

    public long getEntityAddress() {
        return entityAddress;
    }

    public void setEntityAddress(long entityAddress) {
        this.entityAddress = entityAddress;
    }

    public long getEntityPawnAddress() {
        return entityPawnAddress;
    }

    public void setEntityPawnAddress(long entityPawnAddress) {
        this.entityPawnAddress = entityPawnAddress;
    }

    public int getTeamId() {
        return teamId;
    }

    public void setTeamId(int teamId) {
        this.teamId = teamId;
    }

    public int getHealth() {
        return health;
    }

    public void setHealth(int health) {
        this.health = health;
    }

    public int getArmor() {
        return armor;
    }

    public void setArmor(int armor) {
        this.armor = armor;
    }

    public boolean isAlive() {
        return isAlive;
    }

    public void setAlive(boolean alive) {
        isAlive = alive;
    }

    public boolean isLocalPlayer() {
        return isLocalPlayer;
    }

    public void setLocalPlayer(boolean localPlayer) {
        isLocalPlayer = localPlayer;
    }

    public boolean isEnemy() {
        return isEnemy;
    }

    public void setEnemy(boolean enemy) {
        isEnemy = enemy;
    }

    public float getX() {
        return x;
    }

    public void setX(float x) {
        this.x = x;
    }

    public float getY() {
        return y;
    }

    public void setY(float y) {
        this.y = y;
    }

    public float getZ() {
        return z;
    }

    public void setZ(float z) {
        this.z = z;
    }

    public float getAngles() {
        return Angles;
    }

    public void setAngles(float angles) {
        Angles = angles;
    }
}
