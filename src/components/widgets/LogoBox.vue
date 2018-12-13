<template>
    <div class="logo-box">
        <span class="title">{{ title }}</span>
        <span class="subtitle">{{ subtitle }}</span>
        <img src="@/assets/logo.png"/>
    </div>
</template>
<style lang="less" scoped>
.logo-box {
    width: 140px;
    height: 54px;
    img {
        position: absolute;
        left: 24px;
        top: 6px;
        width: 42px;
        height: 42px;
    }
    .title {
        position: absolute;
        color: @text-black;
        font-size: @font-middle;
        line-height: 24px;
        left: 80px;
        top: 6px;
    }
    .subtitle {
        position: absolute;
        color: @text-grey;
        font-size: @font-small;
        line-height: 18px;
        left: 80px;
        top: 30px;
    }
}
</style>
