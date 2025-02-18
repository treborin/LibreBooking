{include file='globalheader.tpl' HideNavBar=true}

<div class="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="square-div">
        <div class="resource-name fw-bold">{$ResourceName}</div>
        <div class="qr-image-container">
            <img src="{$QRImageUrl}" alt="QR Code" class="img-fluid">
        </div>
        <div class="scan-text">Scan to use</div>
    </div>
</div>

<style>
.square-div {
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1;
  border: 2px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
  padding: 10px;
  background-color: #f9f9f9;
}
.qr-image-container {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.resource-name {
  font-size: clamp(1rem, 2vw, 1.5rem);
  font-weight: bold;
}
.scan-text {
  font-size: clamp(0.8rem, 1.5vw, 1.2rem);
  color: #6c757d;
}
</style>

    {* <script type="text/javascript">
    window.print();
</script> *}
{include file='globalfooter.tpl'}