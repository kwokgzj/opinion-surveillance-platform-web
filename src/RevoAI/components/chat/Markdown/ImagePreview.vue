<template>
  <AntImage :src="src" v-bind="$attrs" />
</template>

<script lang="ts">
import { defineComponent, h, PropType } from 'vue'
import {
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons-vue'
import { Image as AntImage, Space } from 'ant-design-vue'
import { download } from '@/RevoAI/utils/download'

export default defineComponent({
  name: 'ImagePreview',
  components: {
    AntImage,
  },
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const toolbarRender = (
      _: any,
      {
        transform: { scale },
        actions: { onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn, onReset },
      }: any,
    ) => {
      return h(
        Space,
        {
          size: 12,
          class: 'toolbar-wrapper',
          style: {
            padding: '0px 24px',
            color: '#fff',
            fontSize: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '100px',
          },
        },
        [
          h(SwapOutlined, {
            rotate: 90,
            onClick: onFlipY,
            style: {
              padding: '12px',
              cursor: 'pointer',
            },
            onMouseover: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '0.3'
            },
            onMouseout: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '1'
            },
          }),
          h(SwapOutlined, {
            onClick: onFlipX,
            style: {
              padding: '12px',
              cursor: 'pointer',
            },
            onMouseover: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '0.3'
            },
            onMouseout: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '1'
            },
          }),
          h(RotateLeftOutlined, {
            onClick: onRotateLeft,
            style: {
              padding: '12px',
              cursor: 'pointer',
            },
            onMouseover: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '0.3'
            },
            onMouseout: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '1'
            },
          }),
          h(RotateRightOutlined, {
            onClick: onRotateRight,
            style: {
              padding: '12px',
              cursor: 'pointer',
            },
            onMouseover: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '0.3'
            },
            onMouseout: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '1'
            },
          }),
          h(ZoomOutOutlined, {
            disabled: scale === 1,
            onClick: onZoomOut,
            style: {
              padding: '12px',
              cursor: 'pointer',
            },
            onMouseover: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '0.3'
            },
            onMouseout: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '1'
            },
          }),
          h(ZoomInOutlined, {
            disabled: scale === 50,
            onClick: onZoomIn,
            style: {
              padding: '12px',
              cursor: 'pointer',
            },
            onMouseover: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '0.3'
            },
            onMouseout: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '1'
            },
          }),
          h(UndoOutlined, {
            onClick: onReset,
            style: {
              padding: '12px',
              cursor: 'pointer',
            },
            onMouseover: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '0.3'
            },
            onMouseout: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '1'
            },
          }),
          h(DownloadOutlined, {
            onClick: () => download(props.src),
            style: {
              padding: '12px',
              cursor: 'pointer',
            },
            onMouseover: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '0.3'
            },
            onMouseout: (e: Event) => {
              const target = e.target as HTMLElement
              if (target.style) target.style.opacity = '1'
            },
          }),
        ],
      )
    }

    return {
      toolbarRender,
    }
  },
})
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>
