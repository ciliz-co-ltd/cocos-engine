import { ALIPAY, RUNTIME_BASED, BYTEDANCE, WECHAT, DEBUG, VIVO } from 'internal:constants';
import { macro } from '../../platform';
import { sys } from '../../platform/sys';
import { GFXDescriptorSet, IGFXDescriptorSetInfo } from '../descriptor-set';
import { GFXBuffer, IGFXBufferInfo, IGFXBufferViewInfo } from '../buffer';
import { GFXCommandBuffer, IGFXCommandBufferInfo } from '../command-buffer';
import { GFXAPI, GFXDevice, GFXFeature, IGFXDeviceInfo, GFXBindingMappingInfo } from '../device';
import { GFXFence, IGFXFenceInfo } from '../fence';
import { GFXFramebuffer, IGFXFramebufferInfo } from '../framebuffer';
import { GFXInputAssembler, IGFXInputAssemblerInfo } from '../input-assembler';
import { GFXPipelineState, IGFXPipelineStateInfo } from '../pipeline-state';
import { GFXQueue, IGFXQueueInfo } from '../queue';
import { GFXRenderPass, IGFXRenderPassInfo } from '../render-pass';
import { GFXSampler, IGFXSamplerInfo } from '../sampler';
import { GFXShader, GFXShaderInfo } from '../shader';
import { GFXTexture, IGFXTextureInfo, IGFXTextureViewInfo } from '../texture';
import { WebGLDescriptorSet } from './webgl-descriptor-set';
import { WebGLBuffer } from './webgl-buffer';
import { WebGLCommandAllocator } from './webgl-command-allocator';
import { WebGLCommandBuffer } from './webgl-command-buffer';
import { WebGLFence } from './webgl-fence';
import { WebGLFramebuffer } from './webgl-framebuffer';
import { WebGLInputAssembler } from './webgl-input-assembler';
import { WebGLDescriptorSetLayout } from './webgl-descriptor-set-layout';
import { WebGLPipelineLayout } from './webgl-pipeline-layout';
import { WebGLPipelineState } from './webgl-pipeline-state';
import { WebGLPrimaryCommandBuffer } from './webgl-primary-command-buffer';
import { WebGLQueue } from './webgl-queue';
import { WebGLRenderPass } from './webgl-render-pass';
import { WebGLSampler } from './webgl-sampler';
import { WebGLShader } from './webgl-shader';
import { WebGLStateCache } from './webgl-state-cache';
import { WebGLTexture } from './webgl-texture';
import { getTypedArrayConstructor, GFXBufferTextureCopy, GFXCommandBufferType, GFXFilter, GFXFormat, GFXFormatInfos,
    GFXQueueType, GFXTextureFlagBit, GFXTextureType, GFXTextureUsageBit, GFXRect } from '../define';
import { GFXFormatToWebGLFormat, GFXFormatToWebGLType, WebGLCmdFuncCopyBuffersToTexture,
    WebGLCmdFuncCopyTexImagesToTexture } from './webgl-commands';
import { IGFXDescriptorSetLayoutInfo, GFXDescriptorSetLayout, IGFXPipelineLayoutInfo, GFXPipelineLayout } from '../..';

export class WebGLDevice extends GFXDevice {

    get gl () {
        return this._webGLRC as WebGLRenderingContext;
    }

    get webGLQueue () {
        return this._queue as WebGLQueue;
    }

    get isAntialias () {
        return this._isAntialias;
    }

    get isPremultipliedAlpha () {
        return this._isPremultipliedAlpha;
    }

    get useVAO () {
        return this._useVAO;
    }

    get destroyShadersImmediately () {
        return this._destroyShadersImmediately;
    }

    get noCompressedTexSubImage2D () {
        return this._noCompressedTexSubImage2D;
    }

    get bindingMappingInfo () {
        return this._bindingMappingInfo;
    }

    get EXT_texture_filter_anisotropic () {
        return this._EXT_texture_filter_anisotropic;
    }

    get EXT_frag_depth () {
        return this._EXT_frag_depth;
    }

    get EXT_shader_texture_lod () {
        return this._EXT_shader_texture_lod;
    }

    get EXT_sRGB () {
        return this._EXT_sRGB;
    }

    get OES_vertex_array_object () {
        return this._OES_vertex_array_object;
    }

    get WEBGL_color_buffer_float () {
        return this._WEBGL_color_buffer_float;
    }

    get WEBGL_compressed_texture_etc1 () {
        return this._WEBGL_compressed_texture_etc1;
    }

    get WEBGL_compressed_texture_pvrtc () {
        return this._WEBGL_compressed_texture_pvrtc;
    }

    get WEBGL_compressed_texture_astc () {
        return this._WEBGL_compressed_texture_astc;
    }

    get WEBGL_compressed_texture_s3tc () {
        return this._WEBGL_compressed_texture_s3tc;
    }

    get WEBGL_compressed_texture_s3tc_srgb () {
        return this._WEBGL_compressed_texture_s3tc_srgb;
    }

    get WEBGL_debug_shaders () {
        return this._WEBGL_debug_shaders;
    }

    get WEBGL_draw_buffers () {
        return this._WEBGL_draw_buffers;
    }

    get WEBGL_lose_context () {
        return this._WEBGL_lose_context;
    }

    get WEBGL_depth_texture () {
        return this._WEBGL_depth_texture;
    }

    get WEBGL_debug_renderer_info () {
        return this._WEBGL_debug_renderer_info;
    }

    get OES_texture_half_float () {
        return this._OES_texture_half_float;
    }

    get OES_texture_half_float_linear () {
        return this._OES_texture_half_float_linear;
    }

    get OES_texture_float () {
        return this._OES_texture_float;
    }

    get OES_standard_derivatives () {
        return this._OES_standard_derivatives;
    }

    get OES_element_index_uint () {
        return this._OES_element_index_uint;
    }

    get ANGLE_instanced_arrays () {
        return this._ANGLE_instanced_arrays;
    }

    public stateCache: WebGLStateCache = new WebGLStateCache();
    public cmdAllocator: WebGLCommandAllocator = new WebGLCommandAllocator();
    public nullTex2D: WebGLTexture | null = null;
    public nullTexCube: WebGLTexture | null = null;

    private _webGLRC: WebGLRenderingContext | null = null;
    private _isAntialias: boolean = true;
    private _isPremultipliedAlpha: boolean = true;
    private _useVAO: boolean = false;
    private _destroyShadersImmediately: boolean = true;
    private _noCompressedTexSubImage2D: boolean = false;
    private _bindingMappingInfo: GFXBindingMappingInfo | null = null;

    private _extensions: string[] | null = null;
    private _EXT_texture_filter_anisotropic: EXT_texture_filter_anisotropic | null = null;
    private _EXT_frag_depth: EXT_frag_depth | null = null;
    private _EXT_shader_texture_lod: EXT_shader_texture_lod | null = null;
    private _EXT_sRGB: EXT_sRGB | null = null;
    private _OES_vertex_array_object: OES_vertex_array_object | null = null;
    private _EXT_color_buffer_half_float: EXT_color_buffer_half_float | null = null;
    private _WEBGL_color_buffer_float: WEBGL_color_buffer_float | null = null;
    private _WEBGL_compressed_texture_etc1: WEBGL_compressed_texture_etc1 | null = null;
    private _WEBGL_compressed_texture_etc: WEBGL_compressed_texture_etc | null = null;
    private _WEBGL_compressed_texture_pvrtc: WEBGL_compressed_texture_pvrtc | null = null;
    private _WEBGL_compressed_texture_astc: WEBGL_compressed_texture_astc | null = null;
    private _WEBGL_compressed_texture_s3tc: WEBGL_compressed_texture_s3tc | null = null;
    private _WEBGL_compressed_texture_s3tc_srgb: WEBGL_compressed_texture_s3tc_srgb | null = null;
    private _WEBGL_debug_shaders: WEBGL_debug_shaders | null = null;
    private _WEBGL_draw_buffers: WEBGL_draw_buffers | null = null;
    private _WEBGL_lose_context: WEBGL_lose_context | null = null;
    private _WEBGL_depth_texture: WEBGL_depth_texture | null = null;
    private _WEBGL_debug_renderer_info: WEBGL_debug_renderer_info | null = null;
    private _OES_texture_half_float: OES_texture_half_float | null = null;
    private _OES_texture_half_float_linear: OES_texture_half_float_linear | null = null;
    private _OES_texture_float: OES_texture_float | null = null;
    private _OES_texture_float_linear: OES_texture_float_linear | null = null;
    private _OES_standard_derivatives: OES_standard_derivatives | null = null;
    private _OES_element_index_uint: OES_element_index_uint | null = null;
    private _ANGLE_instanced_arrays: ANGLE_instanced_arrays | null = null;

    public initialize (info: IGFXDeviceInfo): boolean {

        this._canvas = info.canvasElm as HTMLCanvasElement;

        if (info.isAntialias !== undefined) {
            this._isAntialias = info.isAntialias;
        }

        if (info.isPremultipliedAlpha !== undefined) {
            this._isPremultipliedAlpha = info.isPremultipliedAlpha;
        }

        if (info.bindingMappingInfo !== undefined) {
            this._bindingMappingInfo = info.bindingMappingInfo;
        }

        try {
            const webGLCtxAttribs: WebGLContextAttributes = {
                alpha: macro.ENABLE_TRANSPARENT_CANVAS,
                antialias: this._isAntialias,
                depth: true,
                stencil: true,
                premultipliedAlpha: this._isPremultipliedAlpha,
                preserveDrawingBuffer: false,
                powerPreference: 'default',
                failIfMajorPerformanceCaveat: false,
            };

            /*
            if (WECHAT) {
                webGLCtxAttribs.preserveDrawingBuffer = true;
            }
            */

            this._webGLRC = this._canvas.getContext('webgl', webGLCtxAttribs);
        } catch (err) {
            console.error(err);
            return false;
        }

        if (!this._webGLRC) {
            console.error('This device does not support WebGL.');
            return false;
        }

        this._canvas2D = document.createElement('canvas');
        console.info('WebGL device initialized.');

        this._gfxAPI = GFXAPI.WEBGL;
        this._deviceName = 'WebGL';
        const gl = this._webGLRC;

        this._WEBGL_debug_renderer_info = this.getExtension('WEBGL_debug_renderer_info');
        if (this._WEBGL_debug_renderer_info) {
            this._renderer = gl.getParameter(this._WEBGL_debug_renderer_info.UNMASKED_RENDERER_WEBGL);
            this._vendor = gl.getParameter(this._WEBGL_debug_renderer_info.UNMASKED_VENDOR_WEBGL);
        } else {
            this._renderer = gl.getParameter(gl.RENDERER);
            this._vendor = gl.getParameter(gl.VENDOR);
        }

        this._version = gl.getParameter(gl.VERSION);
        this._maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        this._maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        this._maxFragmentUniformVectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        this._maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        this._maxVertexTextureUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        this._maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        this._maxCubeMapTextureSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
        this._depthBits = gl.getParameter(gl.DEPTH_BITS);
        this._stencilBits = gl.getParameter(gl.STENCIL_BITS);

        if (ALIPAY) {
            this._depthBits = 24;
        }

        this._devicePixelRatio = info.devicePixelRatio || 1.0;
        this._width = this._canvas.width;
        this._height = this._canvas.height;
        this._nativeWidth = Math.max(info.nativeWidth || this._width, 0);
        this._nativeHeight = Math.max(info.nativeHeight || this._height, 0);

        this._colorFmt = GFXFormat.RGBA8;

        if (this._depthBits === 24) {
            if (this._stencilBits === 8) {
                this._depthStencilFmt = GFXFormat.D24S8;
            } else {
                this._depthStencilFmt = GFXFormat.D24;
            }
        } else {
            if (this._stencilBits === 8) {
                this._depthStencilFmt = GFXFormat.D16S8;
            } else {
                this._depthStencilFmt = GFXFormat.D16;
            }
        }

        this._extensions = gl.getSupportedExtensions();
        let extensions = '';
        if (this._extensions) {
            for (const ext of this._extensions) {
                extensions += ext + ' ';
            }

            console.debug('EXTENSIONS: ' + extensions);
        }

        this._EXT_texture_filter_anisotropic = this.getExtension('EXT_texture_filter_anisotropic');
        this._EXT_frag_depth = this.getExtension('EXT_frag_depth');
        this._EXT_shader_texture_lod = this.getExtension('EXT_shader_texture_lod');
        this._EXT_sRGB = this.getExtension('EXT_sRGB');
        this._OES_vertex_array_object = this.getExtension('OES_vertex_array_object');
        this._EXT_color_buffer_half_float = this.getExtension('EXT_color_buffer_half_float');
        this._WEBGL_color_buffer_float = this.getExtension('WEBGL_color_buffer_float');
        this._WEBGL_compressed_texture_etc1 = this.getExtension('WEBGL_compressed_texture_etc1');
        this._WEBGL_compressed_texture_etc = this.getExtension('WEBGL_compressed_texture_etc');
        this._WEBGL_compressed_texture_pvrtc = this.getExtension('WEBGL_compressed_texture_pvrtc');
        this._WEBGL_compressed_texture_astc = this.getExtension('WEBGL_compressed_texture_astc');
        this._WEBGL_compressed_texture_s3tc = this.getExtension('WEBGL_compressed_texture_s3tc');
        this._WEBGL_compressed_texture_s3tc_srgb = this.getExtension('WEBGL_compressed_texture_s3tc_srgb');
        this._WEBGL_debug_shaders = this.getExtension('WEBGL_debug_shaders');
        this._WEBGL_draw_buffers = this.getExtension('WEBGL_draw_buffers');
        this._WEBGL_lose_context = this.getExtension('WEBGL_lose_context');
        this._WEBGL_depth_texture = this.getExtension('WEBGL_depth_texture');
        this._OES_texture_half_float = this.getExtension('OES_texture_half_float');
        this._OES_texture_half_float_linear = this.getExtension('OES_texture_half_float_linear');
        this._OES_texture_float = this.getExtension('OES_texture_float');
        this._OES_texture_float_linear = this.getExtension('OES_texture_float_linear');
        this._OES_standard_derivatives = this.getExtension('OES_standard_derivatives');
        this._OES_element_index_uint = this.getExtension('OES_element_index_uint');
        this._ANGLE_instanced_arrays = this.getExtension('ANGLE_instanced_arrays');

        // platform-specific hacks
        {
            // UC browser instancing implementation doesn't work
            if (sys.browserType === sys.BROWSER_TYPE_UC) {
                this._ANGLE_instanced_arrays = null;
            }

            // bytedance ios depth texture implementation doesn't work
            if (BYTEDANCE && sys.os === sys.OS_IOS) {
                this._WEBGL_depth_texture = null;
            }

            // earlier runtime VAO implementations doesn't work
            if (RUNTIME_BASED && !VIVO) {
                // @ts-ignore
                if (typeof loadRuntime !== 'function' || !loadRuntime() || typeof loadRuntime().getFeature !== 'function' || loadRuntime()
                    .getFeature('webgl.extensions.oes_vertex_array_object.revision') <= 0) {
                    this._OES_vertex_array_object = null;
                }
            }

            // some earlier version of iOS and android wechat implement gl.detachShader incorrectly
            if ((sys.os === sys.OS_IOS && sys.osMainVersion <= 10) ||
                (WECHAT && sys.os === sys.OS_ANDROID)) {
                this._destroyShadersImmediately = false;
            }

            // compressedTexSubImage2D has always been problematic because the parameters differs slightly from GLES
            if (WECHAT) { // and MANY platforms get it wrong
                this._noCompressedTexSubImage2D = true;
            }
        }

        this._features.fill(false);

        if (this._WEBGL_color_buffer_float) {
            this._features[GFXFeature.COLOR_FLOAT] = true;
        }

        if (this._EXT_color_buffer_half_float) {
            this._features[GFXFeature.COLOR_HALF_FLOAT] = true;
        }

        if (this._OES_texture_float) {
            this._features[GFXFeature.TEXTURE_FLOAT] = true;
        }

        if (this._OES_texture_half_float) {
            this._features[GFXFeature.TEXTURE_HALF_FLOAT] = true;
        }

        if (this._OES_texture_float_linear) {
            this._features[GFXFeature.TEXTURE_FLOAT_LINEAR] = true;
        }

        if (this._OES_texture_half_float_linear) {
            this._features[GFXFeature.TEXTURE_HALF_FLOAT_LINEAR] = true;
        }

        this._features[GFXFeature.FORMAT_RGB8] = true;

        if (this._WEBGL_depth_texture) {
            this._features[GFXFeature.FORMAT_D16] = true;
            this._features[GFXFeature.FORMAT_D24] = true;
            this._features[GFXFeature.FORMAT_D24S8] = true;
        }

        if (this._OES_element_index_uint) {
            this._features[GFXFeature.ELEMENT_INDEX_UINT] = true;
        }

        if (this._ANGLE_instanced_arrays) {
            this._features[GFXFeature.INSTANCED_ARRAYS] = true;
        }

        let compressedFormat: string = '';

        if (this._WEBGL_compressed_texture_etc1) {
            this._features[GFXFeature.FORMAT_ETC1] = true;
            compressedFormat += 'etc1 ';
        }

        if (this._WEBGL_compressed_texture_etc) {
            this._features[GFXFeature.FORMAT_ETC2] = true;
            compressedFormat += 'etc2 ';
        }

        if (this._WEBGL_compressed_texture_s3tc) {
            this._features[GFXFeature.FORMAT_DXT] = true;
            compressedFormat += 'dxt ';
        }

        if (this._WEBGL_compressed_texture_pvrtc) {
            this._features[GFXFeature.FORMAT_PVRTC] = true;
            compressedFormat += 'pvrtc ';
        }

        if (this._WEBGL_compressed_texture_astc) {
            this._features[GFXFeature.FORMAT_ASTC] = true;
            compressedFormat += 'astc ';
        }

        if (this._OES_vertex_array_object) {
            this._useVAO = true;
        }

        console.info('RENDERER: ' + this._renderer);
        console.info('VENDOR: ' + this._vendor);
        console.info('VERSION: ' + this._version);
        console.info('DPR: ' + this._devicePixelRatio);
        console.info('SCREEN_SIZE: ' + this._width + ' x ' + this._height);
        console.info('NATIVE_SIZE: ' + this._nativeWidth + ' x ' + this._nativeHeight);
        // console.info('COLOR_FORMAT: ' + GFXFormatInfos[this._colorFmt].name);
        // console.info('DEPTH_STENCIL_FORMAT: ' + GFXFormatInfos[this._depthStencilFmt].name);
        // console.info('MAX_VERTEX_ATTRIBS: ' + this._maxVertexAttributes);
        console.info('MAX_VERTEX_UNIFORM_VECTORS: ' + this._maxVertexUniformVectors);
        // console.info('MAX_FRAGMENT_UNIFORM_VECTORS: ' + this._maxFragmentUniformVectors);
        // console.info('MAX_TEXTURE_IMAGE_UNITS: ' + this._maxTextureUnits);
        // console.info('MAX_VERTEX_TEXTURE_IMAGE_UNITS: ' + this._maxVertexTextureUnits);
        console.info('DEPTH_BITS: ' + this._depthBits);
        console.info('STENCIL_BITS: ' + this._stencilBits);
        if (this._EXT_texture_filter_anisotropic) {
            console.info('MAX_TEXTURE_MAX_ANISOTROPY_EXT: ' + this._EXT_texture_filter_anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        }
        console.info('USE_VAO: ' + this._useVAO);
        console.info('COMPRESSED_FORMAT: ' + compressedFormat);

        // init states
        this.initStates(gl);

        // create queue
        this._queue = this.createQueue({ type: GFXQueueType.GRAPHICS });

        // create primary window
        const canvas = this._webGLRC.canvas as HTMLCanvasElement;

        // create default null texture
        this.nullTex2D = new WebGLTexture(this);
        this.nullTex2D.initialize({
            type: GFXTextureType.TEX2D,
            usage: GFXTextureUsageBit.SAMPLED,
            format: GFXFormat.RGBA8,
            width: 2,
            height: 2,
            flags: GFXTextureFlagBit.GEN_MIPMAP,
        });

        this.nullTexCube = new WebGLTexture(this);
        this.nullTexCube.initialize({
            type: GFXTextureType.TEX2D,
            usage: GFXTextureUsageBit.SAMPLED,
            format: GFXFormat.RGBA8,
            width: 2,
            height: 2,
            layerCount: 6,
            flags: GFXTextureFlagBit.CUBEMAP |  GFXTextureFlagBit.GEN_MIPMAP,
        });

        const nullTexRegion: GFXBufferTextureCopy = {
            buffStride: 0,
            buffTexHeight: 0,
            texOffset: {
                x: 0,
                y: 0,
                z: 0,
            },
            texExtent: {
                width: 2,
                height: 2,
                depth: 1,
            },
            texSubres: {
                mipLevel: 0,
                baseArrayLayer: 0,
                layerCount: 1,
            },
        };

        const nullTexBuff = new Uint8Array(this.nullTex2D.size);
        nullTexBuff.fill(0);
        this.copyBuffersToTexture([nullTexBuff], this.nullTex2D, [nullTexRegion]);

        nullTexRegion.texSubres.layerCount = 6;
        this.copyBuffersToTexture(
            [nullTexBuff, nullTexBuff, nullTexBuff, nullTexBuff, nullTexBuff, nullTexBuff],
            this.nullTexCube, [nullTexRegion]);

        return true;
    }

    public destroy (): void {

        if (this.nullTex2D) {
            this.nullTex2D.destroy();
            this.nullTex2D = null;
        }

        if (this.nullTexCube) {
            this.nullTexCube.destroy();
            this.nullTexCube = null;
        }

        if (this._queue) {
            this._queue.destroy();
            this._queue = null;
        }

        this._extensions = null;

        this._webGLRC = null;
    }

    public resize (width: number, height: number) {
        if (this._width !== width || this._height !== height) {
            console.info('Resizing device: ' + width + 'x' + height);
            this._canvas!.width = width;
            this._canvas!.height = height;
            this._width = width;
            this._height = height;
        }
    }

    public acquire () {
        this.cmdAllocator.releaseCmds();
    }

    public present () {
        const queue = (this._queue as WebGLQueue);
        this._numDrawCalls = queue.numDrawCalls;
        this._numInstances = queue.numInstances;
        this._numTris = queue.numTris;
        queue.clear();
    }

    public createCommandBuffer (info: IGFXCommandBufferInfo): GFXCommandBuffer {
        // const ctor = WebGLCommandBuffer; // opt to instant invocation
        const ctor = info.type === GFXCommandBufferType.PRIMARY ? WebGLPrimaryCommandBuffer : WebGLCommandBuffer;
        const cmdBuff = new ctor(this);
        cmdBuff.initialize(info);
        return cmdBuff;
    }

    public createBuffer (info: IGFXBufferInfo | IGFXBufferViewInfo): GFXBuffer {
        const buffer = new WebGLBuffer(this);
        if (buffer.initialize(info)) {
            return buffer;
        }
        return null!;
    }

    public createTexture (info: IGFXTextureInfo | IGFXTextureViewInfo): GFXTexture {
        const texture = new WebGLTexture(this);
        if (texture.initialize(info)) {
            return texture;
        }
        return null!;
    }

    public createSampler (info: IGFXSamplerInfo): GFXSampler {
        const sampler = new WebGLSampler(this);
        if (sampler.initialize(info)) {
            return sampler;
        }
        return null!;
    }

    public createDescriptorSet (info: IGFXDescriptorSetInfo): GFXDescriptorSet {
        const descriptorSet = new WebGLDescriptorSet(this);
        if (descriptorSet.initialize(info)) {
            return descriptorSet;
        }
        return null!;
    }

    public createShader (info: GFXShaderInfo): GFXShader {
        const shader = new WebGLShader(this);
        if (shader.initialize(info)) {
            return shader;
        }
        return null!;
    }

    public createInputAssembler (info: IGFXInputAssemblerInfo): GFXInputAssembler {
        const inputAssembler = new WebGLInputAssembler(this);
        if (inputAssembler.initialize(info)) {
            return inputAssembler;
        }
        return null!;
    }

    public createRenderPass (info: IGFXRenderPassInfo): GFXRenderPass {
        const renderPass = new WebGLRenderPass(this);
        if (renderPass.initialize(info)) {
            return renderPass;
        }
        return null!;
    }

    public createFramebuffer (info: IGFXFramebufferInfo): GFXFramebuffer {
        const framebuffer = new WebGLFramebuffer(this);
        if (framebuffer.initialize(info)) {
            return framebuffer;
        }
        return null!;
    }

    public createDescriptorSetLayout (info: IGFXDescriptorSetLayoutInfo): GFXDescriptorSetLayout {
        const descriptorSetLayout = new WebGLDescriptorSetLayout(this);
        if (descriptorSetLayout.initialize(info)) {
            return descriptorSetLayout;
        }
        return null!;
    }

    public createPipelineLayout (info: IGFXPipelineLayoutInfo): GFXPipelineLayout {
        const pipelineLayout = new WebGLPipelineLayout(this);
        if (pipelineLayout.initialize(info)) {
            return pipelineLayout;
        }
        return null!;
    }

    public createPipelineState (info: IGFXPipelineStateInfo): GFXPipelineState {
        const pipelineState = new WebGLPipelineState(this);
        if (pipelineState.initialize(info)) {
            return pipelineState;
        }
        return null!;
    }

    public createFence (info: IGFXFenceInfo): GFXFence {
        const fence = new WebGLFence(this);
        if (fence.initialize(info)) {
            return fence;
        }
        return null!;
    }

    public createQueue (info: IGFXQueueInfo): GFXQueue {
        const queue = new WebGLQueue(this);
        if (queue.initialize(info)) {
            return queue;
        }
        return null!;
    }

    public copyBuffersToTexture (buffers: ArrayBufferView[], texture: GFXTexture, regions: GFXBufferTextureCopy[]) {
        WebGLCmdFuncCopyBuffersToTexture(
            this,
            buffers,
            (texture as WebGLTexture).gpuTexture,
            regions);
    }

    public copyTexImagesToTexture (
        texImages: TexImageSource[],
        texture: GFXTexture,
        regions: GFXBufferTextureCopy[]) {

        WebGLCmdFuncCopyTexImagesToTexture(
            this,
            texImages,
            (texture as WebGLTexture).gpuTexture,
            regions);
    }

    public copyFramebufferToBuffer (
        srcFramebuffer: GFXFramebuffer,
        dstBuffer: ArrayBuffer,
        regions: GFXBufferTextureCopy[]) {

        const gl = this._webGLRC as WebGLRenderingContext;
        const gpuFramebuffer = (srcFramebuffer as WebGLFramebuffer).gpuFramebuffer;
        const format = gpuFramebuffer.gpuColorTextures[0].format;
        const glFormat = GFXFormatToWebGLFormat(format, gl);
        const glType = GFXFormatToWebGLType(format, gl);
        const ctor = getTypedArrayConstructor(GFXFormatInfos[format]);

        const curFBO = this.stateCache.glFramebuffer;

        if (this.stateCache.glFramebuffer !== gpuFramebuffer.glFramebuffer) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, gpuFramebuffer.glFramebuffer);
            this.stateCache.glFramebuffer = gpuFramebuffer.glFramebuffer;
        }

        const view = new ctor(dstBuffer);

        for (const region of regions) {

            const w = region.texExtent.width;
            const h = region.texExtent.height;

            gl.readPixels(region.texOffset.x, region.texOffset.y, w, h, glFormat, glType, view);
        }

        if (this.stateCache.glFramebuffer !== curFBO) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, curFBO);
            this.stateCache.glFramebuffer = curFBO;
        }
    }

    public blitFramebuffer (src: GFXFramebuffer, dst: GFXFramebuffer, srcRect: GFXRect, dstRect: GFXRect, filter: GFXFilter) {
    }

    private getExtension (ext: string): any {
        const prefixes = ['', 'WEBKIT_', 'MOZ_'];
        for (let i = 0; i < prefixes.length; ++i) {
            const _ext = this.gl.getExtension(prefixes[i] + ext);
            if (_ext) {
                return _ext;
            }
        }
        return null;
    }

    private initStates (gl: WebGLRenderingContext) {

        gl.activeTexture(gl.TEXTURE0);
        gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // rasteriazer state
        gl.disable(gl.SCISSOR_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(0.0, 0.0);

        // depth stencil state
        gl.enable(gl.DEPTH_TEST);
        gl.depthMask(true);
        gl.depthFunc(gl.LESS);
        gl.depthRange(0.0, 1.0);

        gl.stencilFuncSeparate(gl.FRONT, gl.ALWAYS, 1, 0xffff);
        gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.KEEP, gl.KEEP);
        gl.stencilMaskSeparate(gl.FRONT, 0xffff);
        gl.stencilFuncSeparate(gl.BACK, gl.ALWAYS, 1, 0xffff);
        gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.KEEP, gl.KEEP);
        gl.stencilMaskSeparate(gl.BACK, 0xffff);

        gl.disable(gl.STENCIL_TEST);

        // blend state
        gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
        gl.disable(gl.BLEND);
        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
        gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);
        gl.colorMask(true, true, true, true);
        gl.blendColor(0.0, 0.0, 0.0, 0.0);
    }
}